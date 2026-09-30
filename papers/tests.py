import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Comment, Paper

User = get_user_model()
MEDIA_ROOT = tempfile.mkdtemp()


def pdf(name="paper.pdf"):
    return SimpleUploadedFile(name, b"%PDF-1.4 test", content_type="application/pdf")


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PaperApiTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.author = User.objects.create_user("author", "author@example.com", "pass12345")
        self.other = User.objects.create_user("other", "other@example.com", "pass12345")
        self.paper = Paper.objects.create(
            title="DCF of ACME", summary="Undervalued", pdf_file=pdf(), author=self.author
        )

    def test_anyone_can_list_papers(self):
        response = self.client.get("/api/papers/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertTrue(response.data[0]["pdf_file_url"].startswith("http://testserver/media/"))

    def test_upload_requires_login(self):
        response = self.client.post("/api/papers/", {"title": "x", "summary": "y", "pdf_file": pdf()})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_upload_sets_author_to_current_user(self):
        self.client.force_authenticate(self.other)
        response = self.client.post(
            "/api/papers/",
            {"title": "Comps", "summary": "s", "pdf_file": pdf(), "author": self.author.id},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Paper.objects.get(id=response.data["id"]).author, self.other)

    def test_upload_rejects_non_pdf(self):
        self.client.force_authenticate(self.author)
        response = self.client.post(
            "/api/papers/",
            {"title": "x", "summary": "y", "pdf_file": SimpleUploadedFile("notes.txt", b"hi")},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_client_cannot_set_hidden_flag(self):
        self.client.force_authenticate(self.author)
        response = self.client.post(
            "/api/papers/",
            {"title": "x", "summary": "y", "pdf_file": pdf(), "is_hidden": True},
            format="multipart",
        )
        self.assertFalse(Paper.objects.get(id=response.data["id"]).is_hidden)

    def test_only_author_can_edit_or_delete(self):
        self.client.force_authenticate(self.other)
        self.assertEqual(
            self.client.patch(f"/api/papers/{self.paper.id}/", {"title": "hacked"}).status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(self.client.delete(f"/api/papers/{self.paper.id}/").status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.author)
        self.assertEqual(
            self.client.patch(f"/api/papers/{self.paper.id}/", {"title": "Updated"}).status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(self.client.delete(f"/api/papers/{self.paper.id}/").status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Paper.objects.exists())

    def test_reported_paper_is_hidden_from_non_staff(self):
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post(f"/api/papers/{self.paper.id}/report/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/papers/").data, [])
        self.assertEqual(self.client.get(f"/api/papers/{self.paper.id}/").status_code, status.HTTP_404_NOT_FOUND)

        staff = User.objects.create_user("mod", "mod@example.com", "pass12345", is_staff=True)
        self.client.force_authenticate(staff)
        self.assertEqual(len(self.client.get("/api/papers/").data), 1)


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class CommentApiTests(APITestCase):
    def setUp(self):
        self.author = User.objects.create_user("author", "author@example.com", "pass12345")
        self.other = User.objects.create_user("other", "other@example.com", "pass12345")
        self.paper = Paper.objects.create(title="t", summary="s", pdf_file=pdf(), author=self.author)
        self.url = f"/api/papers/{self.paper.id}/comments/"

    def test_create_and_list_comments(self):
        self.client.force_authenticate(self.other)
        response = self.client.post(self.url, {"content": "Nice thesis"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author_username"], "other")
        self.assertEqual(len(self.client.get(self.url).data), 1)

    def test_only_comment_author_can_edit_or_delete(self):
        comment = Comment.objects.create(paper=self.paper, author=self.author, content="mine")
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.delete(f"{self.url}{comment.id}/").status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.author)
        self.assertEqual(self.client.delete(f"{self.url}{comment.id}/").status_code, status.HTTP_204_NO_CONTENT)

    def test_comment_on_missing_paper_returns_404(self):
        self.client.force_authenticate(self.other)
        response = self.client.post("/api/papers/9999/comments/", {"content": "hi"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
