from django.contrib import admin
from .models import Stock, UserStock, StockAlert

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('ticker', 'company_name', 'current_price', 'price_change_percent', 'sector', 'get_interested_users_count', 'last_updated')
    list_filter = ('sector', 'industry', 'last_updated')
    search_fields = ('ticker', 'company_name', 'sector', 'industry')
    readonly_fields = ('last_updated', 'created_at')
    ordering = ('ticker',)

@admin.register(UserStock)
class UserStockAdmin(admin.ModelAdmin):
    list_display = ('user', 'stock', 'watchlist_priority', 'target_price', 'date_added')
    list_filter = ('watchlist_priority', 'date_added', 'stock__sector')
    search_fields = ('user__username', 'stock__ticker', 'stock__company_name')
    raw_id_fields = ('user', 'stock')
    readonly_fields = ('date_added',)

@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'stock', 'alert_type', 'target_value', 'is_active', 'is_triggered', 'created_at')
    list_filter = ('alert_type', 'is_active', 'is_triggered', 'created_at')
    search_fields = ('user__username', 'stock__ticker')
    raw_id_fields = ('user', 'stock')
    readonly_fields = ('created_at', 'triggered_at')
