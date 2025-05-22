import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import { registerUser } from '../../services/api'; // Adjust path as per your project structure

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState(''); // For password confirmation
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!username.trim() || !email.trim() || !password.trim() || !password2.trim()) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (password !== password2) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Add more sophisticated email validation if needed
    if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
    }

    // Djoser typically requires username, email, password
    const userData = {
      username,
      email,
      password,
      // Djoser might also require re_password if you configure it that way,
      // but usually, it's just password on the /users/ endpoint.
      // If your backend expects password confirmation field, add it here:
      // re_password: password2
    };

    try {
      await registerUser(userData); // registerUser should point to /auth/users/
      setSuccessMessage('Registration successful! Please check your email for verification if required, then log in.');
      // Optionally, redirect after a short delay or keep the message
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect to login after 3 seconds
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response && err.response.data) {
        const responseData = err.response.data;
        // Djoser error format can be an object with field names as keys
        // e.g., {"username": ["This username is already taken."]}
        // Or a simple array of strings, or a detail string.
        if (typeof responseData === 'object') {
          const fieldErrors = Object.entries(responseData)
            .map(([key, value]) => {
              const message = Array.isArray(value) ? value.join(' ') : value;
              return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${message}`;
            })
            .join(' ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          }
        } else if (Array.isArray(responseData)) {
            errorMessage = responseData.join(' ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Registration error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3, // Increased padding
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Slightly more pronounced shadow
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Sign Up
        </Typography>
        {successMessage && (
          <Alert severity="success" sx={{ width: '100%', mt: 1, mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {error && !successMessage && ( // Only show error if no success message
          <Alert severity="error" sx={{ width: '100%', mt: 1, mb: 2 }}>
            {error}
          </Alert>
        )}
        {!successMessage && ( // Hide form after successful registration message
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            error={!!error && error.toLowerCase().includes('username')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={!!error && error.toLowerCase().includes('email')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!error && error.toLowerCase().includes('password')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm Password"
            type="password"
            id="password2"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            disabled={loading}
            error={!!error && error.toLowerCase().includes('password')}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
          <Box textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 'medium' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
        )}
      </Box>
    </Container>
  );
};

export default Register;