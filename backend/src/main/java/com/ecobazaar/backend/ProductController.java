package com.ecobazaar.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping; // New import
import org.springframework.web.bind.annotation.RequestBody; // New import
import org.springframework.beans.factory.annotation.Autowired; // New import
import org.springframework.http.ResponseEntity; // New import
import java.util.List;

@RestController
public class ProductController {

    // --- 1. INJECT THE REPOSITORY ---
    @Autowired
    private ProductRepository productRepository;

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/api/products")
    public List<Product> getProducts() {
        System.out.println("GET /api/products request received!");
        
        // Now it fetches from the REAL database
        return productRepository.findAll();
    }

    // --- 2. THIS IS THE NEW, SECURE ENDPOINT ---
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/api/products")
    public ResponseEntity<Product> addProduct(@RequestBody ProductRequest productRequest) {
        
        System.out.println("POST /api/products request received!");
        
        // 1. Create a new Product object from the request
        Product newProduct = new Product(productRequest);
        
        // 2. Save it to the database
        Product savedProduct = productRepository.save(newProduct);
        
        // 3. Return the saved product with its new ID
        return ResponseEntity.ok(savedProduct);
    }
}