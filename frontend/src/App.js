import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PaperList from './components/papers/PaperList';
import PaperDetail from './components/papers/PaperDetail';
import Navbar from './components/layout/Navbar';

function App() {
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
            <Route element={<ProtectedRoute />}>
              <Route path="/papers" element={<PaperList />} />
              <Route path="/papers/:id" element={<PaperDetail />} />
            </Route>

            {/* Redirect root to papers if authenticated, login if not */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<PaperList />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;