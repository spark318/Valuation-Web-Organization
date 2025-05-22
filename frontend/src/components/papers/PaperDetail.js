import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Alert,
  Box,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { fetchPaperById } from '../../services/paperService';

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentKey, setCommentKey] = useState(0); // For forcing CommentList refresh

  useEffect(() => {
    const loadPaper = async () => {
      try {
        const data = await fetchPaperById(id);
        setPaper(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch paper details');
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadPaper();
  }, [id, isAuthenticated, navigate]);

  const handleCommentPosted = () => {
    setCommentKey(prev => prev + 1); // Force CommentList to refresh
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Skeleton variant="text" height={40} width="60%" />
            <Skeleton variant="text" height={20} width="40%" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={20} width="30%" />
          </CardContent>
        </Card>
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

  if (!paper) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Paper not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {paper.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Author: {paper.author_username}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
            <AccessTimeIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Uploaded: {new Date(paper.uploaded_at).toLocaleDateString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Typography variant="body1" paragraph>
            {paper.summary}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              href={paper.pdf_file_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View PDF
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" gutterBottom>
            Comments
          </Typography>
          
          <CommentForm paperId={id} onCommentPosted={handleCommentPosted} />
          <CommentList key={commentKey} paperId={id} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaperDetail; 