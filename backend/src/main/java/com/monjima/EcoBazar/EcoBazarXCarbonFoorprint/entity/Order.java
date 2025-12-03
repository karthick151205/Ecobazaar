package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private ObjectId id;

    private ObjectId buyerId;
    private String buyerName;
    private String buyerEmail;

    private List<OrderItem> items;

    private String address;
    private String paymentMethod;

    private double deliveryCharge;
    private double discount;
    private double totalAmount;
    private double totalCarbonPoints;

    private OrderStatus status;

    private Date createdAt = new Date();
}
