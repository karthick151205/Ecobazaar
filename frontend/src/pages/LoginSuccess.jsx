import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";

function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get the token from the URL
    const token = searchParams.get('token');

    if (token) {
      console.log("Got token from Google login:", token);

      // 2. Save the token
      localStorage.setItem("token", token);

      // 3. We don't have user info, so let's just save a basic user
      // A better way would be for the backend to send user info too
      // But for now, let's just navigate to the buyer dashboard
      // A full solution would decode the token or have the backend send user info

      console.log("Navigating to dashboard...");
      navigate('/BuyerDashboard');
    } else {
      console.error("No token found after OAuth login.");
      navigate('/login'); // Go back to login if no token
    }

  // Run only once
  }, [searchParams, navigate]); 

  return (
    <div>
      <h2>Logging you in...</h2>
      <p>Please wait, you are being redirected.</p>
    </div>
  );
}

export default LoginSuccess;