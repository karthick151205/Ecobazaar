package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Order;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.OrderItem;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class OrderResponse {

    private String id;
    private String buyerId;
    private String buyerName;
    private String buyerEmail;
    private String address;
    private String paymentMethod;
    private double deliveryCharge;
    private double discount;
    private double totalAmount;
    private double totalCarbonPoints;
    private String status;     // overall order status
    private String createdAt;

    private List<OrderItemResponse> items;

    public OrderResponse(Order order) {
        this.id = order.getId().toHexString();
        this.buyerId = order.getBuyerId().toHexString();
        this.buyerName = order.getBuyerName();
        this.buyerEmail = order.getBuyerEmail();
        this.address = order.getAddress();
        this.paymentMethod = order.getPaymentMethod();
        this.deliveryCharge = order.getDeliveryCharge();
        this.discount = order.getDiscount();
        this.totalAmount = order.getTotalAmount();
        this.totalCarbonPoints = order.getTotalCarbonPoints();
        this.status = order.getStatus().name();
        this.createdAt = order.getCreatedAt() != null ? order.getCreatedAt().toString() : null;

        this.items = order.getItems().stream()
                .map(OrderItemResponse::new)
                .collect(Collectors.toList());
    }

    @Data
    public static class OrderItemResponse {
        private String productId;
        private String sellerId;
        private String productName;
        private double price;
        private int quantity;
        private double carbonPoints;
        private String imageUrl;

        // 🔥 expose seller status to frontend
        private String sellerStatus;

        public OrderItemResponse(OrderItem item) {
            this.productId = item.getProductId().toHexString();
            this.sellerId = item.getSellerId().toHexString();
            this.productName = item.getProductName();
            this.price = item.getPrice();
            this.quantity = item.getQuantity();
            this.carbonPoints = item.getCarbonPoints();
            this.imageUrl = item.getImageUrl();
            this.sellerStatus = item.getSellerStatus() != null
                    ? item.getSellerStatus().name()
                    : null;
        }
    }
}
