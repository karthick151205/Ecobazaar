package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Product;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendController {

    private final ProductRepository productRepository;

    public RecommendController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/recommend/{productId}")
    public List<Product> getRecommendedProducts(@PathVariable String productId) {
        return productRepository.findById(productId)
                .map(Product::getRecommended)
                .map(ids -> {
                    List<Product> recList = new ArrayList<>();
                    for (String id : ids) {
                        productRepository.findById(id).ifPresent(recList::add);
                    }
                    return recList;
                })
                .orElse(Collections.emptyList());
    }
}
