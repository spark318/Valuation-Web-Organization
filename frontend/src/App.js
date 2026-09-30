import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PaperList from './components/papers/PaperList';
import PaperDetail from './components/papers/PaperDetail';
import PaperUploadForm from './components/papers/PaperUploadForm';
import { Watchlist } from './components/stocks';
import UserProfilePage from './components/social/UserProfilePage';

function App() {
  return (
    <Router>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/papers" element={<PaperList />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/upload-paper" element={<PaperUploadForm />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/papers" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
