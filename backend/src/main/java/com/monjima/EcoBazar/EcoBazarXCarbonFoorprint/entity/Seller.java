package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "sellers")
public class Seller {

    @Id
    private String id;

    private String name;
    private String email;
    private String phone;
    private String storeName;
    private String address;

    // Base64 OR image URL
    private String profileImg;
}
