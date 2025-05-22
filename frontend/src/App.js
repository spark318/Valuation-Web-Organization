import React from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

// Import your components
import Login from './components/auth/Login'; // Adjust path if needed
import Register from './components/auth/Register'; // Adjust path if needed

// Placeholder for PaperList or your main content page
const PaperListPlaceholder = () => (
  <Container sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>Papers Page</Typography>
    <Typography>This is where the list of research papers will be displayed.</Typography>
    <Button component={RouterLink} to="/" variant="outlined" sx={{ mt: 2}}>Go to Home</Button>
  </Container>
);

// Placeholder for a Home Page
const HomePagePlaceholder = () => (
  <Container sx={{ mt: 4, textAlign: 'center' }}>
    <Typography variant="h3" gutterBottom>Welcome to the Stock Research Platform</Typography>
    <Typography variant="h6" color="text.secondary">
      Your central hub for accessing and managing research papers.
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Button component={RouterLink} to="/login" variant="contained" color="primary" sx={{ mr: 2 }}>
        Login
      </Button>
      <Button component={RouterLink} to="/register" variant="outlined" color="primary">
        Register
      </Button>
      <Button component={RouterLink} to="/papers" variant="text" color="secondary" sx={{ ml: 2 }}>
        View Papers (Placeholder)
      </Button>
    </Box>
  </Container>
);


function App() {
  return (
    <BrowserRouter>
      <AppBar position="static" sx={{ mb: 4, borderRadius:1, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'primary.main' }}>
            StockResearch
          </Typography>
          <Button color="primary" component={RouterLink} to="/login">Login</Button>
          <Button color="primary" component={RouterLink} to="/register">Register</Button>
          <Button color="primary" component={RouterLink} to="/papers">Papers</Button>
        </Toolbar>
      </AppBar>

      {/* Routes will render their components here */}
      <Routes>
        <Route path="/" element={<HomePagePlaceholder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/papers" element={<PaperListPlaceholder />} />
        {/* You will add more routes here, including protected routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;