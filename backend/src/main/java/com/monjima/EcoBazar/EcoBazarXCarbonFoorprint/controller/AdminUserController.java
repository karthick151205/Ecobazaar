package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.User;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository repo) {
        this.userRepository = repo;
    }

    // 🔵 GET BUYERS
    @GetMapping("/buyers")
    public ResponseEntity<List<User>> getAllBuyers() {
        return ResponseEntity.ok(userRepository.findAllByRole("BUYER"));
    }


    // 🔵 GET PENDING SELLERS
    @GetMapping("/pending-sellers")
    public ResponseEntity<List<User>> getPendingSellers() {
        return ResponseEntity.ok(userRepository.findAllByRoleAndApproved("SELLER", false));
    }

    // 🔴 DELETE USER
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }

    // 🟢 APPROVE SELLER
    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveSeller(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setApproved(true);
                    userRepository.save(user);
                    return ResponseEntity.ok("Seller approved");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
