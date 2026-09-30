import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
} from '@mui/icons-material';
import StockCard from './StockCard';
import StockSearch from './StockSearch';
import { stockService } from '../../services/stockService';

const Watchlist = () => {
  const [userStocks, setUserStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showAddStock, setShowAddStock] = useState(false);

  useEffect(() => {
    fetchWatchlistData();
  }, []);

  const fetchWatchlistData = async () => {
    try {
      setLoading(true);
      const [stocksResponse, summaryResponse] = await Promise.all([
        stockService.getUserStocks(),
        stockService.getWatchlistSummary(),
      ]);
      
      setUserStocks(stocksResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockInterestChange = (stockId, isInterested) => {
    if (!isInterested) {
      setUserStocks(prev => prev.filter(item => item.stock.id !== stockId));
      setSummary(prev => prev ? { ...prev, total_stocks: prev.total_stocks - 1 } : null);
    }
  };

  const handleAddStock = async (stock) => {
    try {
      await stockService.addStockInterest(stock.id, {
        watchlist_priority: 1,
        notes: '',
      });
      
      // Refresh the watchlist
      fetchWatchlistData();
      setShowAddStock(false);
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
    }
  };

  const filterStocksByPriority = (priority) => {
    return userStocks.filter(item => item.watchlist_priority === priority);
  };

  const filteredStocks = (() => {
    switch (tabValue) {
      case 1: return filterStocksByPriority(3); // High priority
      case 2: return filterStocksByPriority(2); // Medium priority
      case 3: return filterStocksByPriority(1); // Low priority
      default: return userStocks; // All stocks
    }
  })();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Watchlist
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddStock(!showAddStock)}
        >
          Add Stock
        </Button>
      </Box>

      {/* Add Stock Section */}
      {showAddStock && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            Add Stock to Watchlist
          </Typography>
          <StockSearch
            onSelectStock={handleAddStock}
            placeholder="Search for stocks to add to your watchlist..."
          />
        </Paper>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {summary.total_stocks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Stocks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error">
                  {summary.high_priority}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Priority
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {summary.medium_priority}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Medium Priority
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {summary.low_priority}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Low Priority
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label={`All (${userStocks.length})`} />
          <Tab label={`High Priority (${summary?.high_priority || 0})`} />
          <Tab label={`Medium Priority (${summary?.medium_priority || 0})`} />
          <Tab label={`Low Priority (${summary?.low_priority || 0})`} />
        </Tabs>
      </Paper>

      {/* Stocks Grid */}
      {filteredStocks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            {tabValue === 0 ? 'No stocks in your watchlist' : 'No stocks with this priority'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 ? 'Add some stocks to get started!' : 'Try switching to a different priority level.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredStocks.map((userStock) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={userStock.id}>
              <StockCard
                stock={userStock.stock}
                isUserInterested={true}
                onInterestChange={handleStockInterestChange}
                showDetails={true}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Watchlist; 