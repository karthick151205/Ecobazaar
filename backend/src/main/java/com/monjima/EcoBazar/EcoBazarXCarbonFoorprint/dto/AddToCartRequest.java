package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto;

import lombok.Data;

@Data
public class AddToCartRequest {

    private String buyerId;
    private String productId;
    private String name;
    private Double price;
    private String image;
    private String category;
    private Double ecoPoints;
}
