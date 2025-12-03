package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.User;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminSellerController {

    private final UserRepository userRepo;

    public AdminSellerController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // 🔵 FETCH ALL SELLERS
    @GetMapping("/sellers")
    public ResponseEntity<List<User>> getAllSellers() {
        return ResponseEntity.ok(userRepo.findAllByRole("SELLER"));
    }

    // 🟢 APPROVE SELLER
    @PostMapping("/seller/approve/{id}")
    public ResponseEntity<?> approveSeller(@PathVariable String id) {
        return userRepo.findById(id)
                .map(seller -> {
                    seller.setApproved(true);
                    userRepo.save(seller);
                    return ResponseEntity.ok("Seller approved");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔴 REJECT SELLER (DELETE)
    @PostMapping("/seller/reject/{id}")
    public ResponseEntity<?> rejectSeller(@PathVariable String id) {
        userRepo.deleteById(id);
        return ResponseEntity.ok("Seller rejected & removed");
    }
}
