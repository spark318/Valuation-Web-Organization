import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import { userService } from '../../services/userService';

const FollowButton = ({ 
  userId, 
  isFollowing, 
  onFollowChange, 
  variant = 'contained', 
  size = 'medium' 
}) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (following) {
        await userService.unfollowUser(userId);
        setFollowing(false);
        onFollowChange?.(false);
      } else {
        await userService.followUser(userId);
        setFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      color={following ? 'secondary' : 'primary'}
      startIcon={
        loading ? (
          <CircularProgress size={16} />
        ) : following ? (
          <PersonRemove />
        ) : (
          <PersonAdd />
        )
      }
      onClick={handleFollow}
      disabled={loading}
      sx={{
        minWidth: following ? 120 : 100,
      }}
    >
      {loading ? 'Processing...' : following ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default FollowButton; 