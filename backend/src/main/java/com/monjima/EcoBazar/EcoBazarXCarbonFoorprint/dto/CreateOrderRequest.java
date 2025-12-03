package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {

    private String buyerId;
    private String buyerName;
    private String buyerEmail;

    private String address;
    private String paymentMethod;

    private double deliveryCharge;
    private double discount;
    private double totalAmount;

    private List<CreateOrderItemDTO> items;
}
