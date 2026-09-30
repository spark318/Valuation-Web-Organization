import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfile from './UserProfile';

const UserProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  return <UserProfile userId={id} isCurrentUser={String(user?.id) === id} />;
};

export default UserProfilePage;
