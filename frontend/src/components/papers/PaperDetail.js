import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from '@mui/material';
import { fetchPaperById } from '../../services/paperService';
import { format } from 'date-fns';

const PaperDetail = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPaper = async () => {
      try {
        setLoading(true);
        const data = await fetchPaperById(id);
        setPaper(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load paper details');
      } finally {
        setLoading(false);
      }
    };

    loadPaper();
  }, [id]);

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

  if (!paper) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Paper not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {paper.title}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            By {paper.author_username || 'Anonymous'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uploaded on {format(new Date(paper.uploaded_at), 'MMMM d, yyyy')}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" paragraph>
          {paper.abstract || 'No abstract available.'}
        </Typography>

        {paper.content && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Content
            </Typography>
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {paper.content}
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaperDetail; 