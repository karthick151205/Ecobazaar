package com.ecobazaar.backend;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails; // <-- Add this import
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    // --- 1. INJECT OUR USER DETAILS SERVICE ---
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        // 1. Get user details from Google
        DefaultOAuth2User oauth2User = (DefaultOAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        // 2. Check if user exists in our database
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // 3. If not, create a new user (default to ROLE_BUYER)
                    System.out.println("Creating new user for: " + email);
                    User newUser = new User(
                        name, 
                        email, 
                        null, // No password for OAuth users
                        "ROLE_BUYER"
                    );
                    return userRepository.save(newUser);
                });

        // --- 2. THIS IS THE FIX ---
        
        // 4. Load the full UserDetails object for our security context
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        
        // 5. Create a correct Authentication object using UserDetails (not the email String)
        Authentication correctAuth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );

        // 6. Generate one of OUR JWT tokens
        String jwt = jwtUtils.generateJwtToken(correctAuth, user); // Pass the correct one

        // 7. Redirect the user back to our React app
        String targetUrl = "http://localhost:3000/login-success?token=" + jwt;
        
        response.sendRedirect(targetUrl);
    }
}