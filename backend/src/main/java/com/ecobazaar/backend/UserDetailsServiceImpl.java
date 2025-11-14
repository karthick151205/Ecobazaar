package com.ecobazaar.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // We are using email as the username
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // --- THIS IS THE FIX ---
        // If the password is null (like for an OAuth user), use an empty string
        String password = user.getPassword() != null ? user.getPassword() : "";
        // --- END OF FIX ---

        // Spring Security User (email, password, roles)
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            password, // Use the non-null password variable
            new ArrayList<>() // We can add roles here later
        );
    }
}