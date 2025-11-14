package com.ecobazaar.backend;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

// This annotation makes it a Spring Bean, so we can inject it
@Component
// This ensures the filter runs only once per request
public class JwtAuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    // This is the main filter method
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Get the JWT token from the request
            String jwt = parseJwt(request);
            
            // 2. If the token is valid
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                
                // 3. Get the email from the token
                String email = jwtUtils.getEmailFromJwtToken(jwt);

                // 4. Load the user's details from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email); // We use email as the username
                
                // 5. Create an "Authentication" object (the "key card")
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Set this user as "logged in" for this request
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            System.err.println("Cannot set user authentication: " + e.getMessage());
        }

        // 7. Pass the request to the next filter
        filterChain.doFilter(request, response);
    }

    // Helper method to get the "Bearer <token>" string
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        // Check if the header has text and starts with "Bearer "
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            // Return just the token part
            return headerAuth.substring(7);
        }

        return null;
    }
}