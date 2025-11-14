package com.ecobazaar.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find a user by their email address
    Optional<User> findByEmail(String email);
}