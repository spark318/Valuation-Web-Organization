from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from .models import Stock, UserStock, StockAlert
from .serializers import (
    StockSerializer, UserStockSerializer, UserStockCreateSerializer,
    StockAlertSerializer, StockSearchSerializer
)

# Create your views here.

class StockListView(generics.ListAPIView):
    """List all stocks with pagination"""
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    
    def get_queryset(self):
        queryset = Stock.objects.all()
        sector = self.request.query_params.get('sector', None)
        if sector:
            queryset = queryset.filter(sector__icontains=sector)
        return queryset

class StockDetailView(generics.RetrieveAPIView):
    """Get details of a specific stock"""
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

@api_view(['GET'])
def search_stocks(request):
    """Search for stocks by ticker or company name"""
    query = request.GET.get('q', '')
    if len(query) < 1:
        return Response({'error': 'Query cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    stocks = Stock.objects.filter(
        ticker__icontains=query
    ) | Stock.objects.filter(
        company_name__icontains=query
    )
    
    stocks = stocks[:20]  # Limit to 20 results
    serializer = StockSerializer(stocks, many=True, context={'request': request})
    return Response(serializer.data)

class UserStockListView(generics.ListCreateAPIView):
    """List user's interested stocks and add new ones"""
    serializer_class = UserStockSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserStock.objects.filter(user=self.request.user).select_related('stock')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserStockCreateSerializer
        return UserStockSerializer

class UserStockDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a user's stock interest"""
    serializer_class = UserStockSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserStock.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_stock_interest(request, stock_id):
    """Add a stock to user's interested stocks"""
    try:
        stock = get_object_or_404(Stock, id=stock_id)
        
        user_stock, created = UserStock.objects.get_or_create(
            user=request.user,
            stock=stock,
            defaults={
                'notes': request.data.get('notes', ''),
                'target_price': request.data.get('target_price'),
                'watchlist_priority': request.data.get('watchlist_priority', 1)
            }
        )
        
        if created:
            serializer = UserStockSerializer(user_stock, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'message': 'Stock already in your watchlist'}, 
                status=status.HTTP_200_OK
            )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_stock_interest(request, stock_id):
    """Remove a stock from user's interested stocks"""
    try:
        stock = get_object_or_404(Stock, id=stock_id)
        user_stock = UserStock.objects.filter(
            user=request.user,
            stock=stock
        ).first()
        
        if user_stock:
            user_stock.delete()
            return Response(
                {'message': 'Stock removed from watchlist'}, 
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'message': 'Stock not in your watchlist'}, 
                status=status.HTTP_200_OK
            )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class StockAlertListView(generics.ListCreateAPIView):
    """List user's stock alerts and create new ones"""
    serializer_class = StockAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StockAlert.objects.filter(user=self.request.user).select_related('stock')

class StockAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a stock alert"""
    serializer_class = StockAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StockAlert.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_watchlist_summary(request):
    """Get a summary of user's watchlist"""
    user_stocks = UserStock.objects.filter(user=request.user).select_related('stock')
    
    summary = {
        'total_stocks': user_stocks.count(),
        'high_priority': user_stocks.filter(watchlist_priority=3).count(),
        'medium_priority': user_stocks.filter(watchlist_priority=2).count(),
        'low_priority': user_stocks.filter(watchlist_priority=1).count(),
        'sectors': list(user_stocks.values_list('stock__sector', flat=True).distinct()),
    }
    
    return Response(summary)
