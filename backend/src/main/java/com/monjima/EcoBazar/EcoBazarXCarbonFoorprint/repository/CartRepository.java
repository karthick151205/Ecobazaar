package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CartRepository extends MongoRepository<CartItem, String> {

    List<CartItem> findByBuyerId(String buyerId);

    List<CartItem> findByBuyerIdAndProductId(String buyerId, String productId);
}
