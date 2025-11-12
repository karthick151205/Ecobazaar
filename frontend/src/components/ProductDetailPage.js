// File: frontend/src/components/ProductDetailPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // Import Link for navigation
import '../App.css'; // Reuse some styles

function ProductDetailPage() {
  const [product, setProduct] = useState(null); // State for a single product
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { productId } = useParams(); // Get the 'productId' from the URL
  const [message, setMessage] = useState(''); // State for Add to Cart feedback

  useEffect(() => {
    setLoading(true); // Start loading each time productId changes
    setError(null);  // Clear previous errors
    setMessage(''); // Clear cart messages when loading new product

    // Fetch data for the specific product ID
    axios.get(`http://localhost:8080/api/products/${productId}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Error fetching product ${productId}:`, error);
        // More specific error message based on potential issues
        if (error.response && error.response.status === 404) {
             setError(`Product with ID ${productId} not found.`);
        } else if (error.request) {
             setError('Could not connect to the backend. Is it running?');
        } else {
             setError('An error occurred while loading product details.');
        }
        setLoading(false);
      });
  }, [productId]); // Re-run effect ONLY if productId changes

  // Function to handle adding the product to the cart
  const handleAddToCart = () => {
    setMessage('Adding to cart...'); // Show temporary message
    setError(null); // Clear previous errors if trying again

    // Make the POST request to the backend cart endpoint
    axios.post(`http://localhost:8080/api/cart/add/${productId}`)
      .then(response => {
        // Use message from backend if available, otherwise use a generic success message
        const successMsg = response.data?.message || 'Product added successfully!';
        setMessage(successMsg);
        console.log("Add to cart response:", response.data);

        // Clear message after a few seconds
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(error => {
        console.error("Error adding product to cart:", error);
        let errorMsg = 'Failed to add product. Please try again.'; // Default error

        // Handle specific errors (like 401 Unauthorized, 404 Not Found)
        if (error.response) {
            if (error.response.status === 401) {
                // This usually means the user needs to log in
                errorMsg = 'Please log in to add items to the cart.';
            } else if (error.response.status === 403) {
                 // May happen if logged in but wrong role (unlikely now, but good to handle)
                 errorMsg = 'You do not have permission to add items.';
            } else if (error.response.status === 404) {
                 // Product ID not found on server during POST (shouldn't happen if GET worked)
                 errorMsg = 'Product not found on server.';
            } else if (error.response.data && error.response.data.message) {
                // Use backend error message if provided
                errorMsg = error.response.data.message;
            }
        } else if (error.request) {
            // Network error (backend likely down)
            errorMsg = 'Could not connect to the cart service.';
        }
        
        setMessage(errorMsg); // Set the specific or default error message

         // Optionally clear error message after a longer duration
         setTimeout(() => setMessage(''), 5000);
      });
  };


  // --- Render Loading State ---
  if (loading) {
    return <div className="status-message">Loading product details...</div>;
  }

  // --- Render Error State ---
  if (error) {
    // Display error message prominently
    return (
        <div>
            <div className="status-message error-message">{error}</div>
            <br />
            <Link to="/" className="back-link"> &larr; Back to Products</Link>
        </div>
    );
  }

  // --- Render Product Not Found (if backend returns null/empty) ---
  if (!product) {
    return (
         <div>
            <div className="status-message">Product data not available.</div>
            <br />
            <Link to="/" className="back-link"> &larr; Back to Products</Link>
         </div>
    );
  }

  // --- Render Product Details ---
  return (
    <div className="product-detail-container">
      <h2>{product.name}</h2>
      <div className="product-detail-item">
        <p><strong>Description:</strong> {product.description}</p>
        {/* Ensure price exists and format it */}
        <p><strong>Price:</strong> ${product.price != null ? product.price.toFixed(2) : 'N/A'}</p>
        <p><strong>Carbon Rating:</strong> {product.carbonRating}</p>
        <p><strong>Carbon Score:</strong> {product.carbonScore}</p>
        {/* Add more details if needed */}
      </div>

      {/* --- Add to Cart Button and Message --- */}
      <button onClick={handleAddToCart} className="add-to-cart-button">
        Add to Cart
      </button>
      {/* Display message - conditionally apply error class */}
      {message && (
          <p className={`cart-message ${message.toLowerCase().includes('failed') || message.toLowerCase().includes('log in') || message.toLowerCase().includes('error') ? 'error' : ''}`}>
              {message}
          </p>
      )}


      <br />
      {/* Link back to homepage */}
      <Link to="/" className="back-link"> &larr; Back to Products</Link>
    </div>
  );
}

export default ProductDetailPage;
