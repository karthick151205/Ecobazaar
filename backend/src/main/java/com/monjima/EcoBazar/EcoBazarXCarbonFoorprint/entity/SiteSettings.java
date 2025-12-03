package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "site_settings")
public class SiteSettings {

    @Id
    private String id;

    // 🛍 General
    private String siteName;

    // 🛠 Controls
    private boolean maintenanceMode;
    private boolean allowUsers;
    private boolean allowSellers;

    // 🌿 Eco system
    private boolean ecoPointsEnabled;
    private int ecoRate; // points per ₹100

    // 💸 Orders & payment
    private boolean codEnabled;
    private double deliveryCharge;
    private double freeDeliveryMin;

    // Default constructor with some defaults
    public SiteSettings() {
        this.siteName = "EcoBazaar - Shopping Mart";
        this.maintenanceMode = false;
        this.allowUsers = true;
        this.allowSellers = true;
        this.ecoPointsEnabled = true;
        this.ecoRate = 5;
        this.codEnabled = true;
        this.deliveryCharge = 40.0;
        this.freeDeliveryMin = 500.0;
    }
}
