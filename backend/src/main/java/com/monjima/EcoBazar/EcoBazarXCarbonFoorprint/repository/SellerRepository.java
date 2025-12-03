package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Seller;

@Repository
public interface SellerRepository extends MongoRepository<Seller, String> {

    // Find seller using email (for login)
    Seller findByEmail(String email);
}
