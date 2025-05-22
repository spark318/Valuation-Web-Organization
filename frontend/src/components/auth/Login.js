import React, { useState } from 'react'; // Removed useContext as it's optional here

import { useNavigate } from 'react-router-dom';

import {

Button,

TextField,

Container,

Typography,

Box,

CircularProgress,

Alert

} from '@mui/material';

import { loginUser } from '../../services/api'; // Adjust path as per your project structure

// If you have an AuthContext to update global auth state, you would import and use it.

// import { AuthContext } from '../../context/AuthContext';



const Login = () => {

const [username, setUsername] = useState('');

const [password, setPassword] = useState('');

const [error, setError] = useState('');

const [loading, setLoading] = useState(false);

const navigate = useNavigate();

// const { setAuthData } = useContext(AuthContext); // Example if AuthContext provides a setter



const handleSubmit = async (event) => {

event.preventDefault();

setLoading(true);

setError('');



if (!username.trim() || !password.trim()) {

setError('Both username and password are required.');

setLoading(false);

return;

}



try {

// The loginUser service function should handle the actual API call

// and is expected to return data containing tokens on success,

// or throw an error that Axios might structure with err.response.data

const responseData = await loginUser(username, password);



if (responseData && responseData.access && responseData.refresh) {

// Store tokens in localStorage

localStorage.setItem('accessToken', responseData.access);

localStorage.setItem('refreshToken', responseData.refresh);



// Optional: If using AuthContext, update its state

// if (setAuthData) {

// setAuthData({

// accessToken: responseData.access,

// refreshToken: responseData.refresh,

// // You might want to fetch user details here and store them in context too

// });

// }



// Navigate to the papers page or a dashboard

navigate('/papers');

} else {

// This case handles scenarios where loginUser resolves but doesn't return expected tokens

setError('Login successful, but token data was not received. Please contact support.');

}

} catch (err) {

let errorMessage = 'Login failed. Please try again.';

// Axios errors often have a 'response' object with server-provided details

if (err.response && err.response.data) {

const responseData = err.response.data;

if (responseData.detail) {

// Common for Djoser/DRF authentication errors (e.g., "No active account...")

errorMessage = responseData.detail;

} else if (typeof responseData === 'object') {

// Handle field-specific errors (e.g., {"username": ["This field is required."]})

const fieldErrors = Object.entries(responseData)

.map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)

.join(' ');

if (fieldErrors) {

errorMessage = fieldErrors;

}

}

} else if (err.message) {

// Fallback for network errors or other issues where err.response is not available

errorMessage = err.message;

}

setError(errorMessage);

console.error('Login error:', err.response || err);

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

padding: 2,

borderRadius: 2,

boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .03)', // Subtle shadow

}}

>

<Typography component="h1" variant="h5" gutterBottom>

Sign In

</Typography>

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

error={!!error && (error.toLowerCase().includes('username') || error.includes('Both username and password'))} // Highlight field if error relates to it

/>

<TextField

margin="normal"

required

fullWidth

name="password"

label="Password"

type="password"

id="password"

autoComplete="current-password"

value={password}

onChange={(e) => setPassword(e.target.value)}

disabled={loading}

error={!!error && (error.toLowerCase().includes('password') || error.includes('Both username and password'))} // Highlight field

/>

{error && (

<Alert severity="error" sx={{ width: '100%', mt: 2, mb: 1 }}>

{error}

</Alert>

)}

<Button

type="submit"

fullWidth

variant="contained"

sx={{ mt: 3, mb: 2, py: 1.5 }} // Slightly taller button

disabled={loading}

>

{loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}

</Button>

{/* You can add a link to the registration page here if needed */}

{/* Example:

<Box textAlign="center">

<Typography variant="body2">

Don't have an account?{' '}

<Link component={RouterLink} to="/register" sx={{ fontWeight: 'medium' }}>

Sign Up

</Link>

</Typography>

</Box>

*/}

</Box>

</Box>

</Container>

);

};



export default Login;