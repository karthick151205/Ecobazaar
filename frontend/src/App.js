import React, { useState, useEffect } from 'react';
import apiClient from './api/axiosConfig'; // Use the configured Axios instance
import './App.css';

// Import routing components and ALL page components
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductDetailPage from './components/ProductDetailPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// --- Auth Context (Simple version for now) ---
// This allows child components to access the current user and logout function
// For more complex apps, consider dedicated state management libraries (Zustand, Redux)
export const AuthContext = React.createContext(null);

// --- ProductList Component (Remains the same as before) ---
function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        apiClient.get("/products") // Uses the configured apiClient
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("There was an error fetching the products:", error);
                setError("Failed to load products. Please ensure the backend is running.");
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="status-message">Loading products...</div>;
    if (error) return <div className="status-message error-message">{error}</div>;
    if (products.length === 0) return <div className="status-message">No products found.</div>;

    return (
        <div className="product-list-container">
            <h2>Our Products</h2>
            <div className="product-list">
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        <h3>
                            <Link to={`/product/${product.id}`} className="product-link">
                                {product.name}
                            </Link>
                        </h3>
                        <p>{product.description}</p>
                        <p>Price: ${product.price != null ? product.price.toFixed(2) : 'N/A'}</p>
                        <p>Carbon Rating: {product.carbonRating} (Score: {product.carbonScore})</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
// --- End ProductList ---


// --- Main App Component ---
function App() {
    // --- Global Auth State ---
    // Stores { username, role, token } if logged in, otherwise null
    const [currentUser, setCurrentUser] = useState(null);

    // --- Load user from localStorage on initial app load ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');

        // If all items exist, set the currentUser state
        if (token && username && role) {
            setCurrentUser({ token, username, role });
            console.log("App loaded: User found in storage:", { username, role });
        } else {
             console.log("App loaded: No user found in storage.");
             // Ensure any leftover items are cleared if incomplete
             localStorage.removeItem('token');
             localStorage.removeItem('username');
             localStorage.removeItem('role');
        }
    }, []); // Empty dependency array means this runs only once when the App component mounts

    // --- Logout Function ---
    // Clears user data from localStorage and state, then redirects
    const handleLogout = () => {
        if (currentUser) { // Check if a user is actually logged in
             console.log("Logging out user:", currentUser.username);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setCurrentUser(null); // Update the state to reflect logged-out status
        // Use window.location for a simple redirect after logout
        // For more complex routing needs, especially within components, use useNavigate
        window.location.href = '/login';
    };
    // --- End Auth State & Logout ---

    return (
        // Provide the current user state and logout function to all child components via Context
        <AuthContext.Provider value={{ currentUser, setCurrentUser, handleLogout }}>
             <Router>
                <div className="App">
                    <header className="App-header">
                        <nav className="main-nav">
                            <Link to="/" className="nav-link">Home</Link> |
                            {/* --- Conditionally Render Navigation Links --- */}
                            {currentUser ? (
                                // If user is logged in, show username, role, and Logout button
                                <>
                                    <span className="nav-user">Welcome, {currentUser.username} ({currentUser.role})</span> |
                                    <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
                                    {/* Add Cart link maybe here later? */}
                                </>
                            ) : (
                                // If user is not logged in, show Login and Register links
                                <>
                                    <Link to="/login" className="nav-link">Login</Link> |
                                    <Link to="/register" className="nav-link">Register</Link>
                                </>
                            )}
                            {/* --- End Conditional Navigation --- */}
                        </nav>

                        <h1><Link to="/" className="home-link">Welcome to EcoBazaar</Link></h1>

                        <Routes>
                            <Route path="/" element={<ProductList />} />
                            <Route path="/product/:productId" element={<ProductDetailPage />} />
                            {/* Pass setCurrentUser down to LoginPage - needed if LoginPage updates state directly */}
                            {/* Alternatively, LoginPage could import and use the AuthContext */}
                            <Route path="/login" element={<LoginPage /* Pass setCurrentUser={setCurrentUser} if needed */ />} />
                            <Route path="/register" element={<RegisterPage />} />
                            {/* Add Cart route later */}
                            {/* <Route path="/cart" element={<CartPage />} /> */}

                            {/* Example Protected Route (Needs more setup, e.g., a RequireAuth component) */}
                            {/* {currentUser?.role === 'ROLE_ADMIN' && (
                                <Route path="/admin" element={<AdminDashboard />} />
                            )} */}
                        </Routes>
                    </header>
                </div>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;

