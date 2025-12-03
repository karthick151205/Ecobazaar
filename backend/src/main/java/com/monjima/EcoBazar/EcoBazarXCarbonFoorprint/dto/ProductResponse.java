package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductResponse {

    private String id;
    private String name;
    private String description;
    private double price;

    private int stock;
    private String category;

    private int ecoPoints;
    private String image;

    private String sellerId;
    private int sold;

    private String dateAdded;
}
