package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.CarbonRules;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Product;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.CarbonRulesRepository;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.ProductRepository;

@RestController
@RequestMapping("/seller")
public class SellerController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CarbonRulesRepository carbonRulesRepository;

    @PostMapping("/{sellerId}/products")
    public ResponseEntity<?> addProduct(
            @PathVariable String sellerId,
            @RequestBody Product product
    ) {

        CarbonRules rules = carbonRulesRepository.findFirstByOrderByIdAsc();
        if (rules == null) {
            return ResponseEntity.status(500).body("Carbon Rules not found");
        }

        double price = product.getPrice();
        int ecoPoints;

        if (price <= rules.getLowRange()) {
            ecoPoints = rules.getLowScore();
        } else if (price <= rules.getMediumRange()) {
            ecoPoints = rules.getMediumScore();
        } else if (price <= rules.getHighRange()) {
            ecoPoints = rules.getHighScore();
        } else {
            ecoPoints = rules.getHighScore() * 2;
        }

        product.setEcoPoints(ecoPoints);
        product.setSellerId(sellerId);
        product.setSold(0);

        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }
}
