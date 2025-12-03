package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto;

import java.util.List;

public class OrderRequest {

    private String buyerId;
    private List<String> productIds;
    private double totalAmount;

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public List<String> getProductIds() { return productIds; }
    public void setProductIds(List<String> productIds) { this.productIds = productIds; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
}
