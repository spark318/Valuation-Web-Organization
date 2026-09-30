from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Follow

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_then_obtain_jwt(self):
        response = self.client.post("/api/auth/users/", {
            "username": "newuser", "email": "new@example.com",
            "password": "Str0ng-pass!", "re_password": "Str0ng-pass!",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post("/api/token/", {"username": "newuser", "password": "Str0ng-pass!"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"JWT {response.data['access']}")
        me = self.client.get("/api/auth/users/me/")
        self.assertEqual(me.data["email"], "new@example.com")


class PrivacyTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user("alice", "alice@example.com", "pass12345")
        self.bob = User.objects.create_user("bob", "bob@example.com", "pass12345")

    def test_other_users_email_is_hidden(self):
        self.assertNotIn("email", self.client.get(f"/api/users/{self.alice.id}/").data)

        self.client.force_authenticate(self.bob)
        self.assertNotIn("email", self.client.get(f"/api/users/{self.alice.id}/").data)
        results = self.client.get("/api/users/search/?q=ali").data
        self.assertNotIn("email", results[0])

    def test_user_sees_own_email(self):
        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.get(f"/api/users/{self.alice.id}/").data["email"], "alice@example.com")
        self.assertEqual(self.client.get("/api/users/profile/").data["email"], "alice@example.com")


class FollowTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user("alice", "alice@example.com", "pass12345")
        self.bob = User.objects.create_user("bob", "bob@example.com", "pass12345")
        self.client.force_authenticate(self.alice)

    def test_follow_and_unfollow(self):
        response = self.client.post(f"/api/users/{self.bob.id}/follow/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.client.post(f"/api/users/{self.bob.id}/follow/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.bob.get_followers_count(), 1)

        bob = self.client.get(f"/api/users/{self.bob.id}/").data
        self.assertTrue(bob["is_following"])
        self.assertEqual(bob["followers_count"], 1)

        self.client.delete(f"/api/users/{self.bob.id}/unfollow/")
        self.assertFalse(Follow.objects.exists())

    def test_cannot_follow_self(self):
        response = self.client.post(f"/api/users/{self.alice.id}/follow/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_follow_missing_user_returns_404(self):
        self.assertEqual(self.client.post("/api/users/9999/follow/").status_code, status.HTTP_404_NOT_FOUND)

    def test_follow_requires_login(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post(f"/api/users/{self.bob.id}/follow/").status_code, status.HTTP_401_UNAUTHORIZED)
