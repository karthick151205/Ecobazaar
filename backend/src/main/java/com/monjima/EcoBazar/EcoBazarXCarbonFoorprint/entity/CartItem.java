package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cart")
public class CartItem {

    @Id
    private String id;

    private String buyerId;

    private String productId;

    // 🟢 NEW: to carry seller info from product → order
    private String sellerId;

    private String name;
    private Double price;
    private String image;
    private String category;
    private Double ecoPoints;

    private Integer quantity = 1;
}
