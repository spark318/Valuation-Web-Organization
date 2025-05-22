import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PaperList from './components/papers/PaperList';
import PaperDetail from './components/papers/PaperDetail';
import PaperUploadForm from './components/papers/PaperUploadForm';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('ProtectedRoute rendering:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('ProtectedRoute: Still loading auth state');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected content');
  return children;
};

function App() {
  console.log('App component rendering');
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/papers" element={
              <ProtectedRoute>
                <PaperList />
              </ProtectedRoute>
            } />
            <Route path="/papers/:id" element={
              <ProtectedRoute>
                <PaperDetail />
              </ProtectedRoute>
            } />
            <Route path="/upload-paper" element={
              <ProtectedRoute>
                <PaperUploadForm />
              </ProtectedRoute>
            } />

            {/* Redirect root to login if not authenticated */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;