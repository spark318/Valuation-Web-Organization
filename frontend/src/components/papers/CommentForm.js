import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { createComment } from '../../services/commentService';

const CommentForm = ({ paperId, onCommentPosted }) => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      await createComment(paperId, content.trim());
      setContent('');
      onCommentPosted();
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Please log in to leave a comment.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
        disabled={loading}
        sx={{ mb: 2 }}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        disabled={loading || !content.trim()}
      >
        {loading ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            Posting...
          </>
        ) : (
          'Post Comment'
        )}
      </Button>
    </Box>
  );
};

export default CommentForm; 