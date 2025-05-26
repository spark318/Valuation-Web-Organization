import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Paper,
  Box,
} from '@mui/material';
import { fetchPapers } from '../../services/paperService';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const PaperList = () => {
  console.log('PaperList component rendering');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  console.log('Current auth state:', { isAuthenticated });

  useEffect(() => {
    console.log('PaperList useEffect triggered');
    const loadPapers = async () => {
      try {
        console.log('Starting to fetch papers...');
        const data = await fetchPapers();
        console.log('Papers data received:', data);
        setPapers(data);
        setError('');
      } catch (err) {
        console.error('Error in loadPapers:', err);
        setError(err.message || 'Failed to fetch papers');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      console.log('User is authenticated, loading papers');
      loadPapers();
    } else {
      console.log('User is not authenticated, skipping paper load');
    }
  }, [isAuthenticated]);

  console.log('Current component state:', { loading, error, papersCount: Array.isArray(papers) ? papers.length : 0 });

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Please log in to view papers</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Research Papers
      </Typography>
      
      {(!Array.isArray(papers) || papers.length === 0) ? (
        <Alert severity="info">No papers available</Alert>
      ) : (
        <Paper elevation={2}>
          <List>
            {papers.map((paper) => (
              <ListItem
                key={paper.id}
                component={Link}
                to={`/papers/${paper.id}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={paper.title}
                  secondary={`Author: ${paper.author_username}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default PaperList; 