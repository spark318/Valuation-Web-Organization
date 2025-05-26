import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  Info,
} from '@mui/icons-material';
import { stockService } from '../../services/stockService';

const StockCard = ({ 
  stock, 
  isUserInterested = false, 
  onInterestChange, 
  showDetails = false,
  onViewDetails 
}) => {
  const [loading, setLoading] = useState(false);
  const [interested, setInterested] = useState(isUserInterested);

  const handleInterestToggle = async () => {
    setLoading(true);
    try {
      if (interested) {
        await stockService.removeStockInterest(stock.id);
        setInterested(false);
        onInterestChange?.(stock.id, false);
      } else {
        await stockService.addStockInterest(stock.id, {
          watchlist_priority: 1,
          notes: '',
        });
        setInterested(true);
        onInterestChange?.(stock.id, true);
      }
    } catch (error) {
      console.error('Error updating stock interest:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap}`;
  };

  const isPositiveChange = stock.price_change >= 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="h3" fontWeight="bold">
              {stock.ticker}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {stock.company_name}
            </Typography>
          </Box>
          
          <IconButton
            onClick={handleInterestToggle}
            disabled={loading}
            color={interested ? 'primary' : 'default'}
            size="small"
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : interested ? (
              <Star />
            ) : (
              <StarBorder />
            )}
          </IconButton>
        </Box>

        <Box mb={2}>
          <Typography variant="h5" component="div" fontWeight="bold">
            {formatPrice(stock.current_price)}
          </Typography>
          
          <Box display="flex" alignItems="center" mt={1}>
            {isPositiveChange ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={isPositiveChange ? 'success.main' : 'error.main'}
              ml={0.5}
            >
              {isPositiveChange ? '+' : ''}{stock.price_change?.toFixed(2)} (
              {isPositiveChange ? '+' : ''}{stock.price_change_percent?.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {stock.sector && (
            <Chip label={stock.sector} size="small" variant="outlined" />
          )}
          {stock.market_cap && (
            <Chip 
              label={formatMarketCap(stock.market_cap)} 
              size="small" 
              variant="outlined" 
            />
          )}
        </Box>

        <Box display="flex" justify="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {stock.interested_users_count} interested
          </Typography>
          
          {showDetails && (
            <Button
              size="small"
              startIcon={<Info />}
              onClick={() => onViewDetails?.(stock)}
            >
              Details
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockCard; 