package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Product;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.CarbonRules;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.ProductRepository;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.CarbonRulesRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    private CarbonRulesRepository carbonRulesRepo;  // ⭐ injected

    public ProductService(ProductRepository repo) {
        this.productRepository = repo;
    }

    // ⭐ Calculate eco points using admin rules
    private int calculateEcoPoints(Product p) {

        // ⬇⬇⬇ CORRECT method based on your repository
        CarbonRules rules = carbonRulesRepo.findFirstByOrderByIdAsc();

        if (rules == null) {
            return p.getEcoPoints() != null ? p.getEcoPoints() : 50;
        }

        double base = rules.getBaseEcoPoints();
        double multiplier = 1;

        if (p.getCategory() != null) {
            switch (p.getCategory().toLowerCase()) {
                case "plastic":
                    multiplier = rules.getPlasticMultiplier();
                    break;

                case "clothing":
                    multiplier = rules.getClothingMultiplier();
                    break;

                case "electronics":
                    multiplier = rules.getElectronicsMultiplier();
                    break;

                case "accessories":
                    multiplier = rules.getAccessoriesMultiplier();
                    break;

                default:
                    multiplier = 1;
            }
        }

        return (int) Math.round(base * multiplier);
    }

    // Seller creates product
    public Product createProduct(String sellerId, Product p) {
        p.setId(null);
        p.setSellerId(sellerId);

        // ⭐ Apply admin carbon rules
        p.setEcoPoints(calculateEcoPoints(p));

        p.setSold(0);
        return productRepository.save(p);
    }

    // Seller's products
    public List<Product> getProductsForSeller(String sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    // Update (re-calc eco points)
    public Product updateProduct(Product updated) {

        updated.setEcoPoints(calculateEcoPoints(updated));

        return productRepository.save(updated);
    }

    public void deleteProduct(String productId, String sellerId) {
        Optional<Product> opt = productRepository.findById(productId);
        if (opt.isPresent()) {
            Product p = opt.get();
            if (sellerId.equals(p.getSellerId())) {
                productRepository.deleteById(productId);
            }
        }
    }

    // For buyers
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}
