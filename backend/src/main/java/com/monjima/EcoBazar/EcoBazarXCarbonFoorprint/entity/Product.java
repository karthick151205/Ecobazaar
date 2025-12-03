package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String sellerId;   // connect product to seller

    private String name;
    private String description;
    private String category;

    private double price;
    private int stock;
    private int sold;
    private Integer ecoPoints;

    private String image;
    private Instant dateAdded = Instant.now();
private List<String> recommended;


    public List<String> getRecommended() {
        return recommended;
    }
    public void setRecommended(List<String> recommended) {
    this.recommended = recommended;
}

    // ⭐ NEW FIELD
    private boolean approved = false;

    public Product() {}

    // ---------------- GETTERS & SETTERS -----------------

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public int getSold() {
        return sold;
    }

    public void setSold(int sold) {
        this.sold = sold;
    }

    public Integer getEcoPoints() {
        return ecoPoints;
    }

    public void setEcoPoints(Integer ecoPoints) {
        this.ecoPoints = ecoPoints;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Instant getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(Instant dateAdded) {
        this.dateAdded = dateAdded;
    }

    // ⭐ APPROVED (Admin moderates product)

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }
}
