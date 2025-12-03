package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import org.bson.types.ObjectId;

public class OrderItem {

    private ObjectId productId;
    private ObjectId sellerId;

    private String productName;
    private double price;
    private int quantity;
    private double carbonPoints = 0.0;
    private String imageUrl;

    // Buyer-facing per-item status (optional)
    private OrderStatus status;

    // 🔥 Seller-only status (this is what seller updates)
    private OrderStatus sellerStatus;

    public ObjectId getProductId() {
        return productId;
    }

    public void setProductId(ObjectId productId) {
        this.productId = productId;
    }

    public ObjectId getSellerId() {
        return sellerId;
    }

    public void setSellerId(ObjectId sellerId) {
        this.sellerId = sellerId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getCarbonPoints() {
        return carbonPoints;
    }

    public void setCarbonPoints(double carbonPoints) {
        this.carbonPoints = carbonPoints;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    // 🔥 NEW FIELD for seller progress
    public OrderStatus getSellerStatus() {
        return sellerStatus;
    }

    public void setSellerStatus(OrderStatus sellerStatus) {
        this.sellerStatus = sellerStatus;
    }
}
