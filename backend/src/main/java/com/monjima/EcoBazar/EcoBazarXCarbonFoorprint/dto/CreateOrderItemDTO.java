package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto;

import lombok.Data;

@Data
public class CreateOrderItemDTO {

    private String productId;
    private String sellerId;

    private String productName;
    private double price;
    private int quantity;
    private String imageUrl;
}
