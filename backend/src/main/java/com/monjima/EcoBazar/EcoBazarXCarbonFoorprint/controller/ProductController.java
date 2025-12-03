package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Product;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService svc) {
        this.productService = svc;
    }

    // ------- BUYER PUBLIC LIST -------
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ------- SELLER LIST PRODUCTS -------
    @GetMapping("/seller/{sellerId}/products")
    public ResponseEntity<List<Product>> getSellerProducts(@PathVariable String sellerId) {
        return ResponseEntity.ok(productService.getProductsForSeller(sellerId));
    }

    // ⭐⭐⭐ CREATE PRODUCT (Fix for your 404 error)
    @PostMapping("/seller/product/{sellerId}")
    public ResponseEntity<?> addProduct(
            @PathVariable String sellerId,
            @RequestBody Product product
    ) {
        try {
            Product saved = productService.createProduct(sellerId, product);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving product: " + e.getMessage());
        }
    }

    // ------- UPDATE PRODUCT -------
    @PutMapping("/seller/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable String productId,
            @RequestBody Product updated
    ) {
        return productService.getProductById(productId)
                .map(existing -> {
                    updated.setId(existing.getId());
                    updated.setSellerId(existing.getSellerId());
                    Product saved = productService.updateProduct(updated);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ------- DELETE PRODUCT -------
    @DeleteMapping("/seller/products/{productId}/{sellerId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable String productId,
            @PathVariable String sellerId
    ) {
        productService.deleteProduct(productId, sellerId);
        return ResponseEntity.ok("Deleted");
    }
}
