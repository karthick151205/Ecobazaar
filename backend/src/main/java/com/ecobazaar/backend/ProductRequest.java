package com.ecobazaar.backend;

public class ProductRequest {
    private String name;
    private double price;
    private int stock;
    private String category;
    private String image;
    private String description; // <-- New
    private int ecoPoints;    // <-- New

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getDescription() { return description; } // <-- New
    public void setDescription(String description) { this.description = description; } // <-- New
    public int getEcoPoints() { return ecoPoints; } // <-- New
    public void setEcoPoints(int ecoPoints) { this.ecoPoints = ecoPoints; } // <-- New
}