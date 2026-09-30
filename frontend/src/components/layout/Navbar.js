import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            Valuation Hub
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/papers"
                  color="inherit"
                >
                  Papers
                </Button>
                <Button
                  component={RouterLink}
                  to="/watchlist"
                  color="inherit"
                  startIcon={<ShowChartIcon />}
                >
                  Watchlist
                </Button>
                <Button
                  component={RouterLink}
                  to="/upload-paper"
                  color="inherit"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Paper
                </Button>
                <Button
                  component={RouterLink}
                  to={`/users/${user?.id}`}
                  color="inherit"
                  sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                  {user?.username}
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  color="inherit"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 