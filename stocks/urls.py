from django.urls import path
from . import views

app_name = 'stocks'

urlpatterns = [
    # Stock management
    path('', views.StockListView.as_view(), name='stock-list'),
    path('<int:pk>/', views.StockDetailView.as_view(), name='stock-detail'),
    path('search/', views.search_stocks, name='search-stocks'),
    
    # User stock interests
    path('user/', views.UserStockListView.as_view(), name='user-stocks'),
    path('user/<int:pk>/', views.UserStockDetailView.as_view(), name='user-stock-detail'),
    path('user/summary/', views.user_watchlist_summary, name='user-watchlist-summary'),
    
    # Stock interest management by stock ID
    path('<int:stock_id>/interest/', views.add_stock_interest, name='add-stock-interest'),
    path('<int:stock_id>/remove/', views.remove_stock_interest, name='remove-stock-interest'),
    
    # Stock alerts
    path('alerts/', views.StockAlertListView.as_view(), name='stock-alerts'),
    path('alerts/<int:pk>/', views.StockAlertDetailView.as_view(), name='stock-alert-detail'),
] 