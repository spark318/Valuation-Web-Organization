import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  Link,
  Grid,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  Language,
  CalendarToday,
  Edit,
} from '@mui/icons-material';
import { format } from 'date-fns';
import FollowButton from './FollowButton';
import { userService } from '../../services/userService';

const UserProfile = ({ userId, isCurrentUser = false, onEdit }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    userService.getUserDetails(userId)
      .then((response) => setUser(response.data))
      .catch(() => setError('Failed to load user profile'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleFollowChange = (isFollowing) => {
    setUser(prev => ({
      ...prev,
      followers_count: prev.followers_count + (isFollowing ? 1 : -1),
      is_following: isFollowing,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">
            {error || 'User not found'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 2 }}
            src={user.avatar}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box flex={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h5" component="h1">
                  {fullName || user.username}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  @{user.username}
                </Typography>
              </Box>
              
              <Box>
                {isCurrentUser ? (
                  <IconButton onClick={onEdit} color="primary">
                    <Edit />
                  </IconButton>
                ) : (
                  <FollowButton
                    userId={user.id}
                    isFollowing={user.is_following}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {user.bio && (
          <Typography variant="body1" paragraph>
            {user.bio}
          </Typography>
        )}

        <Grid container spacing={2} mb={2}>
          {user.location && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" ml={1}>
                  {user.location}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {user.website && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <Language fontSize="small" color="action" />
                <Link href={user.website} target="_blank" rel="noopener noreferrer" ml={1}>
                  <Typography variant="body2">
                    Website
                  </Typography>
                </Link>
              </Box>
            </Grid>
          )}
        </Grid>

        <Box display="flex" alignItems="center" mb={2}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="body2" ml={1}>
            Joined {format(new Date(user.date_joined), 'MMMM yyyy')}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={3}>
          <Box>
            <Typography variant="h6" component="span">
              {user.following_count}
            </Typography>
            <Typography variant="body2" component="span" ml={1}>
              Following
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h6" component="span">
              {user.followers_count}
            </Typography>
            <Typography variant="body2" component="span" ml={1}>
              Followers
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserProfile; 