from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Stock(models.Model):
    """Model for stock information"""
    ticker = models.CharField(max_length=10, unique=True, db_index=True)
    company_name = models.CharField(max_length=200)
    sector = models.CharField(max_length=100, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    market_cap = models.BigIntegerField(null=True, blank=True)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_change = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    price_change_percent = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    volume = models.BigIntegerField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['ticker']
    
    def __str__(self):
        return f"{self.ticker} - {self.company_name}"
    
    def get_interested_users_count(self):
        """Get the number of users interested in this stock"""
        return self.interested_users.count()

class UserStock(models.Model):
    """Model to track user interest in stocks"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='interested_stocks'
    )
    stock = models.ForeignKey(
        Stock, 
        on_delete=models.CASCADE, 
        related_name='interested_users'
    )
    notes = models.TextField(blank=True, help_text="Personal notes about this stock")
    target_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="User's target price for this stock"
    )
    watchlist_priority = models.IntegerField(
        default=1, 
        choices=[(1, 'Low'), (2, 'Medium'), (3, 'High')],
        help_text="Priority level in user's watchlist"
    )
    date_added = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'stock')
        ordering = ['-watchlist_priority', '-date_added']
    
    def __str__(self):
        return f"{self.user.username} interested in {self.stock.ticker}"

class StockAlert(models.Model):
    """Model for stock price alerts"""
    ALERT_TYPES = [
        ('above', 'Price Above'),
        ('below', 'Price Below'),
        ('change', 'Price Change %'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stock_alerts')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=10, choices=ALERT_TYPES)
    target_value = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    is_triggered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    triggered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.stock.ticker} {self.alert_type} {self.target_value}"
