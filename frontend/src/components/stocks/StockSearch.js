import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Paper,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Search, TrendingUp, TrendingDown } from '@mui/icons-material';
import { debounce } from 'lodash';
import { stockService } from '../../services/stockService';

const StockSearch = ({ onSelectStock, placeholder = "Search stocks...", fullWidth = true }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Debounce so typing "AAPL" sends one request instead of four.
  const debouncedSearch = useMemo(
    () => debounce(async (searchTerm) => {
      if (searchTerm.length < 1) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await stockService.searchStocks(searchTerm);
        setOptions(response.data);
      } catch (error) {
        console.error('Error searching stocks:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(inputValue);
  }, [inputValue, debouncedSearch]);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderOption = (props, option) => {
    const { key, ...optionProps } = props;
    const isPositiveChange = option.price_change_percent >= 0;
    
    return (
      <Box component="li" key={key} {...optionProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {option.ticker}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {option.company_name}
            </Typography>
            {option.sector && (
              <Typography variant="caption" color="text.secondary">
                {option.sector}
              </Typography>
            )}
          </Box>
          
          {option.current_price && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2">
                {formatPrice(option.current_price)}
              </Typography>
              {option.price_change_percent !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {isPositiveChange ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="caption"
                    color={isPositiveChange ? 'success.main' : 'error.main'}
                    ml={0.5}
                  >
                    {isPositiveChange ? '+' : ''}{option.price_change_percent.toFixed(2)}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Autocomplete
      fullWidth={fullWidth}
      options={options}
      getOptionLabel={(option) => `${option.ticker} - ${option.company_name}`}
      renderOption={renderOption}
      loading={loading}
      loadingText="Searching stocks..."
      noOptionsText={inputValue.length < 1 ? "Start typing to search stocks" : "No stocks found"}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, newValue) => {
        if (newValue) {
          onSelectStock(newValue);
          setInputValue('');
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      PaperComponent={({ children, ...other }) => (
        <Paper {...other} sx={{ mt: 1 }}>
          {children}
        </Paper>
      )}
    />
  );
};

export default StockSearch; 