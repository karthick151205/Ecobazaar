package com.ecobazaar.backend;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Lob; // <-- New Import
import jakarta.persistence.Column; // <-- New Import
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue
    private int id;
    
    private String name;
    private double price;
    private int stock;
    private int sold;
    private String category;

    @Lob // For long Base64 strings
    @Column(length = 1000000) // Set a large length
    private String image;
    
    @Lob // For long description strings
    @Column(length = 2000) // Set a large length
    private String description; // <-- New
    
    private int ecoPoints;    // <-- New

    // JPA needs an empty constructor
    public Product() {
    }

    // Constructor for our POST request
    public Product(ProductRequest req) {
        this.name = req.getName();
        this.price = req.getPrice();
        this.stock = req.getStock();
        this.category = req.getCategory();
        this.image = req.getImage();
        this.description = req.getDescription(); // <-- New
        this.ecoPoints = req.getEcoPoints();   // <-- New
        this.sold = 0; // New products have 0 sales
    }

    // Constructor we used for dummy data (keep it)
    public Product(int id, String name, double price, int stock, int sold, String category, String image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.sold = sold;
        this.category = category;
        this.image = image;
        this.description = "Default description"; // Default
        this.ecoPoints = 50; // Default
    }

    // --- Getters and Setters (All are needed) ---
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public int getSold() { return sold; }
    public void setSold(int sold) { this.sold = sold; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getDescription() { return description; } // <-- New
    public void setDescription(String description) { this.description = description; } // <-- New
    public int getEcoPoints() { return ecoPoints; } // <-- New
    public void setEcoPoints(int ecoPoints) { this.ecoPoints = ecoPoints; } // <-- New
}