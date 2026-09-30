from rest_framework import serializers
from .models import Stock, UserStock, StockAlert


def validate_existing_stock_id(value):
    if not Stock.objects.filter(id=value).exists():
        raise serializers.ValidationError('Stock not found.')
    return value

class StockSerializer(serializers.ModelSerializer):
    interested_users_count = serializers.SerializerMethodField()
    is_user_interested = serializers.SerializerMethodField()
    
    class Meta:
        model = Stock
        fields = ('id', 'ticker', 'company_name', 'sector', 'industry', 
                 'market_cap', 'current_price', 'price_change', 
                 'price_change_percent', 'volume', 'last_updated', 
                 'interested_users_count', 'is_user_interested')
        read_only_fields = ('last_updated',)
    
    def get_interested_users_count(self, obj):
        return obj.get_interested_users_count()
    
    def get_is_user_interested(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.interested_users.filter(user=request.user).exists()
        return False

class UserStockSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True, validators=[validate_existing_stock_id])
    
    class Meta:
        model = UserStock
        fields = ('id', 'stock', 'stock_id', 'notes', 'target_price', 
                 'watchlist_priority', 'date_added')
        read_only_fields = ('date_added',)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UserStockCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStock
        fields = ('stock', 'notes', 'target_price', 'watchlist_priority')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class StockAlertSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True, validators=[validate_existing_stock_id])
    
    class Meta:
        model = StockAlert
        fields = ('id', 'stock', 'stock_id', 'alert_type', 'target_value', 
                 'is_active', 'is_triggered', 'created_at', 'triggered_at')
        read_only_fields = ('is_triggered', 'created_at', 'triggered_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class StockSearchSerializer(serializers.Serializer):
    """Serializer for stock search results"""
    ticker = serializers.CharField()
    company_name = serializers.CharField()
    sector = serializers.CharField(required=False)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    price_change_percent = serializers.DecimalField(max_digits=6, decimal_places=2, required=False) 