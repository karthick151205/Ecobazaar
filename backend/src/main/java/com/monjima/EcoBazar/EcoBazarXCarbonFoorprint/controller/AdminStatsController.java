package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.ProductRepository;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminStatsController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminStatsController(UserRepository userRepo, ProductRepository productRepo) {
        this.userRepository = userRepo;
        this.productRepository = productRepo;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {

        long users = userRepository.findAllByRole("BUYER").size();
        long sellers = userRepository.findAllByRole("SELLER").size();
        long products = productRepository.count();

        // Later you can calculate CO₂ saved. For now hardcode:
        long co2 = products * 2; // example: 2kg saved per product

        return ResponseEntity.ok(
                new StatsResponse(users, sellers, products, co2)
        );
    }

    static class StatsResponse {
        public long users;
        public long sellers;
        public long products;
        public long co2;

        public StatsResponse(long users, long sellers, long products, long co2) {
            this.users = users;
            this.sellers = sellers;
            this.products = products;
            this.co2 = co2;
        }
    }
}
