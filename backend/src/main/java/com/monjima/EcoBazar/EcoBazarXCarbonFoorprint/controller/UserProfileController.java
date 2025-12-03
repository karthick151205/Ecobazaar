package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.UserProfileRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.User;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.UserRepository;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserProfileController {

    @Autowired
    private UserRepository userRepo;

    // ===========================================
    // GET PROFILE
    // ===========================================
    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getUserProfile(@PathVariable String email) {

        List<User> users = userRepo.findAllByEmail(email);

        if (users.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        // pick seller if exists
        User user = users.stream()
                .filter(u -> "SELLER".equalsIgnoreCase(u.getRole()))
                .findFirst()
                .orElse(users.get(0));

        return ResponseEntity.ok(user);
    }

    // ===========================================
    // UPDATE PROFILE
    // ===========================================
    @PutMapping("/profile/{email}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String email,
            @RequestBody UserProfileRequest req) {

        List<User> users = userRepo.findAllByEmail(email);

        if (users.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = users.stream()
                .filter(u -> "SELLER".equalsIgnoreCase(u.getRole()))
                .findFirst()
                .orElse(users.get(0));

        user.setName(req.getName());
        user.setPhone(req.getPhone());
        user.setStoreName(req.getStoreName());
        user.setAddress(req.getAddress());
        user.setProfileImg(req.getProfileImg()); // Base64 image stored

        userRepo.save(user);

        return ResponseEntity.ok(user);
    }
}
