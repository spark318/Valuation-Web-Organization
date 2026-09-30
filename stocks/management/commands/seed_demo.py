"""Seed the database with sample stocks and demo accounts so the app can be explored locally."""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from stocks.models import Stock
from users.models import Follow

# Static snapshot for demo purposes; prices are not live market data.
SAMPLE_STOCKS = [
    {
        'ticker': 'AAPL',
        'company_name': 'Apple Inc.',
        'sector': 'Technology',
        'industry': 'Consumer Electronics',
        'market_cap': 3000000000000,  # 3 trillion
        'current_price': 175.25,
        'price_change': 2.15,
        'price_change_percent': 1.24,
        'volume': 45000000
    },
    {
        'ticker': 'GOOGL',
        'company_name': 'Alphabet Inc.',
        'sector': 'Technology',
        'industry': 'Internet Services',
        'market_cap': 1800000000000,  # 1.8 trillion
        'current_price': 142.50,
        'price_change': -1.25,
        'price_change_percent': -0.87,
        'volume': 28000000
    },
    {
        'ticker': 'MSFT',
        'company_name': 'Microsoft Corporation',
        'sector': 'Technology',
        'industry': 'Software',
        'market_cap': 2800000000000,  # 2.8 trillion
        'current_price': 378.85,
        'price_change': 5.20,
        'price_change_percent': 1.39,
        'volume': 22000000
    },
    {
        'ticker': 'TSLA',
        'company_name': 'Tesla, Inc.',
        'sector': 'Consumer Cyclical',
        'industry': 'Auto Manufacturers',
        'market_cap': 850000000000,  # 850 billion
        'current_price': 267.84,
        'price_change': -8.45,
        'price_change_percent': -3.06,
        'volume': 85000000
    },
    {
        'ticker': 'AMZN',
        'company_name': 'Amazon.com, Inc.',
        'sector': 'Consumer Cyclical',
        'industry': 'Internet Retail',
        'market_cap': 1500000000000,  # 1.5 trillion
        'current_price': 145.25,
        'price_change': 3.15,
        'price_change_percent': 2.22,
        'volume': 35000000
    },
    {
        'ticker': 'NVDA',
        'company_name': 'NVIDIA Corporation',
        'sector': 'Technology',
        'industry': 'Semiconductors',
        'market_cap': 1200000000000,  # 1.2 trillion
        'current_price': 485.25,
        'price_change': 12.45,
        'price_change_percent': 2.63,
        'volume': 42000000
    },
    {
        'ticker': 'META',
        'company_name': 'Meta Platforms, Inc.',
        'sector': 'Communication Services',
        'industry': 'Internet Content & Information',
        'market_cap': 950000000000,  # 950 billion
        'current_price': 375.85,
        'price_change': -2.15,
        'price_change_percent': -0.57,
        'volume': 18000000
    },
    {
        'ticker': 'JPM',
        'company_name': 'JPMorgan Chase & Co.',
        'sector': 'Financial Services',
        'industry': 'Banks - Diversified',
        'market_cap': 580000000000,  # 580 billion
        'current_price': 195.75,
        'price_change': 1.85,
        'price_change_percent': 0.95,
        'volume': 12000000
    },
    {
        'ticker': 'JNJ',
        'company_name': 'Johnson & Johnson',
        'sector': 'Healthcare',
        'industry': 'Drug Manufacturers - General',
        'market_cap': 420000000000,  # 420 billion
        'current_price': 160.25,
        'price_change': 0.75,
        'price_change_percent': 0.47,
        'volume': 8000000
    },
    {
        'ticker': 'V',
        'company_name': 'Visa Inc.',
        'sector': 'Financial Services',
        'industry': 'Credit Services',
        'market_cap': 520000000000,  # 520 billion
        'current_price': 240.50,
        'price_change': 2.25,
        'price_change_percent': 0.94,
        'volume': 6500000
    }
]

DEMO_USERS = [
    ("demo", "demo@example.com"),
    ("alice", "alice@example.com"),
    ("bob", "bob@example.com"),
]
DEMO_PASSWORD = "demo-pass-123"


class Command(BaseCommand):
    help = "Create sample stocks and demo users (password: %s)." % DEMO_PASSWORD

    def handle(self, *args, **options):
        for stock_data in SAMPLE_STOCKS:
            Stock.objects.update_or_create(ticker=stock_data["ticker"], defaults=stock_data)
        self.stdout.write(f"Stocks: {Stock.objects.count()}")

        User = get_user_model()
        users = []
        for username, email in DEMO_USERS:
            user, created = User.objects.get_or_create(username=username, defaults={"email": email})
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            users.append(user)

        demo, alice, bob = users
        Follow.objects.get_or_create(follower=demo, followed=alice)
        Follow.objects.get_or_create(follower=alice, followed=demo)
        Follow.objects.get_or_create(follower=bob, followed=alice)

        self.stdout.write(self.style.SUCCESS(
            f"Demo users ready: {', '.join(u for u, _ in DEMO_USERS)} (password: {DEMO_PASSWORD})"
        ))
