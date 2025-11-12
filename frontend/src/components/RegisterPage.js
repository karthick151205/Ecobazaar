import React, { useState } from 'react';
// Use the configured Axios instance
import apiClient from '../api/axiosConfig'; // Adjust path as needed
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        setMessage('');

        // Use apiClient for the request
        apiClient.post('/auth/register', { username, password }) // Base URL /api is already set
            .then(response => {
                console.log('Registration successful:', response.data);
                setMessage('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(err => {
                console.error('Registration error:', err);
                if (err.response && err.response.data && err.response.data.message) {
                    setMessage(`Registration failed: ${err.response.data.message}`);
                } else if (err.request) {
                    setMessage('Registration failed: Could not connect to the server.');
                } else {
                    setMessage('Registration failed. Please try again.');
                }
            });
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
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
                {message && <p className={message.startsWith('Registration failed') ? "error-message" : "success-message"}>{message}</p>}
                <button type="submit" className="auth-button">Register</button>
            </form>
            <p className="auth-switch-link">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

export default RegisterPage;
