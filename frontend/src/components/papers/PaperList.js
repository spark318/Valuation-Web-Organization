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

const PaperList = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPapers = async () => {
      try {
        setLoading(true);
        const data = await fetchPapers();
        setPapers(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load papers');
      } finally {
        setLoading(false);
      }
    };

    loadPapers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
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
      
      {papers.length === 0 ? (
        <Alert severity="info">No papers available.</Alert>
      ) : (
        <Paper elevation={2}>
          <List>
            {papers.map((paper) => (
              <ListItem
                key={paper.id}
                component={Link}
                to={`/papers/${paper.id}`}
                sx={{
                  borderBottom: '1px solid #eee',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      {paper.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {paper.author_username || 'Anonymous'}
                      </Typography>
                      {' — '}
                      {format(new Date(paper.uploaded_at), 'MMM d, yyyy')}
                    </>
                  }
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