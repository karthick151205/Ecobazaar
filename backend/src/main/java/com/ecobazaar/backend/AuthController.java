package com.ecobazaar.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        // This line checks the email and password
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        // If successful, set the authentication in context
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Find the user details to get the role and ID
        User user = userRepository.findByEmail(loginRequest.getEmail()).get();

        // Generate the JWT token
        String jwt = jwtUtils.generateJwtToken(authentication, user);
        
        // Send the token and user info back to React
        return ResponseEntity.ok(new JwtResponse(
            jwt,
            user.getId(),
            user.getEmail(),
            user.getRole()
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already taken!");
        }

        String role = "ROLE_" + signupRequest.getRole().toUpperCase(); 

        User user = new User(
            signupRequest.getName(),
            signupRequest.getEmail(),
            passwordEncoder.encode(signupRequest.getPassword()),
            role
        );

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}