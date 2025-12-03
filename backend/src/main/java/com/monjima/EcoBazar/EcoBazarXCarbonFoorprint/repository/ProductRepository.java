package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Product;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    // 🔥 for seller-owned products
    List<Product> findBySellerId(String sellerId);
    List<Product> findByCategory(String category);
    List<Product> findByIdIn(List<ObjectId> ids);
    
    
}
