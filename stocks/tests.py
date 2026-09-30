from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Stock, UserStock

User = get_user_model()


class StockApiTests(APITestCase):
    def setUp(self):
        self.apple = Stock.objects.create(ticker="AAPL", company_name="Apple Inc.", sector="Technology")
        self.ko = Stock.objects.create(ticker="KO", company_name="Coca-Cola Company", sector="Consumer Staples")
        self.user = User.objects.create_user("alice", "alice@example.com", "pass12345")
        self.other = User.objects.create_user("bob", "bob@example.com", "pass12345")

    def test_search_matches_ticker_or_company_name(self):
        self.assertEqual([s["ticker"] for s in self.client.get("/api/stocks/search/?q=aapl").data], ["AAPL"])
        self.assertEqual([s["ticker"] for s in self.client.get("/api/stocks/search/?q=cola").data], ["KO"])
        self.assertEqual(self.client.get("/api/stocks/search/?q=").status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_to_watchlist_and_summary(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(f"/api/stocks/{self.apple.id}/interest/", {"watchlist_priority": 3, "notes": "iPhone cycle"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.client.post(f"/api/stocks/{self.apple.id}/interest/").status_code, status.HTTP_200_OK)

        summary = self.client.get("/api/stocks/user/summary/").data
        self.assertEqual(summary["total_stocks"], 1)
        self.assertEqual(summary["high_priority"], 1)

        detail = self.client.get("/api/stocks/search/?q=AAPL").data[0]
        self.assertTrue(detail["is_user_interested"])
        self.assertEqual(detail["interested_users_count"], 1)

    def test_invalid_priority_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(f"/api/stocks/{self.apple.id}/interest/", {"watchlist_priority": 99})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_watchlist_is_private_to_each_user(self):
        UserStock.objects.create(user=self.other, stock=self.ko)
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get("/api/stocks/user/").data, [])
        entry = UserStock.objects.get(user=self.other)
        self.assertEqual(self.client.delete(f"/api/stocks/user/{entry.id}/").status_code, status.HTTP_404_NOT_FOUND)

    def test_remove_from_watchlist(self):
        UserStock.objects.create(user=self.user, stock=self.apple)
        self.client.force_authenticate(self.user)
        self.client.delete(f"/api/stocks/{self.apple.id}/remove/")
        self.assertFalse(UserStock.objects.exists())

    def test_missing_stock_returns_404(self):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.post("/api/stocks/9999/interest/").status_code, status.HTTP_404_NOT_FOUND)

    def test_alert_with_unknown_stock_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/stocks/alerts/", {"stock_id": 9999, "alert_type": "above", "target_value": "10"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.post("/api/stocks/alerts/", {"stock_id": self.ko.id, "alert_type": "above", "target_value": "70"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class SeedDemoTests(APITestCase):
    def test_seed_demo_is_idempotent(self):
        call_command("seed_demo", stdout=open("/dev/null", "w"))
        call_command("seed_demo", stdout=open("/dev/null", "w"))
        self.assertEqual(Stock.objects.count(), 10)
        self.assertEqual(User.objects.filter(username__in=["demo", "alice", "bob"]).count(), 3)
