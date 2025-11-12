import React, { useState } from 'react';
import apiClient from '../api/axiosConfig'; // Use the configured Axios instance
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

// We'll manage login state globally in App.js soon, but keep this simple for now
function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        setError('');

        apiClient.post('/auth/login', { username, password })
            .then(response => {
                console.log('Login successful:', response.data);

                // --- STORE TOKEN, USERNAME, and ROLE ---
                if (response.data && response.data.token && response.data.username && response.data.role) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('username', response.data.username);
                    localStorage.setItem('role', response.data.role); // Store the role

                    // TODO: Update global state (will be handled in App.js)

                    navigate('/'); // Navigate to homepage on success
                } else {
                     console.error('Login response missing token, username, or role:', response.data);
                     setError('Login successful, but incomplete user data received.');
                }
                // --- END STORE ---
            })
            .catch(err => {
                console.error('Login error:', err);
                 if (err.response) {
                     if (err.response.status === 401) {
                        setError('Invalid username or password.');
                    } else {
                        setError(`Login failed: ${err.response.data?.message || 'Server error'}`);
                    }
                 } else if (err.request) {
                     setError('Login failed. Could not connect to the server.');
                 } else {
                    setError('Login failed. An unexpected error occurred.');
                }
            });
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="auth-button">Login</button>
            </form>
            <p className="auth-switch-link">
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default LoginPage;

