import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';

const CommentList = ({ paperId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/papers/${paperId}/comments/`, {
        headers: {
          'Authorization': `JWT ${token}`
        }
      });
      setComments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [paperId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }

  if (comments.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
        No comments yet. Be the first to comment!
      </Typography>
    );
  }

  return (
    <List>
      {comments.map((comment, index) => (
        <React.Fragment key={comment.id}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={
                <Typography variant="subtitle2" color="text.secondary">
                  {comment.author_username} • {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                </Typography>
              }
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {comment.content}
                </Typography>
              }
            />
          </ListItem>
          {index < comments.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default CommentList; 