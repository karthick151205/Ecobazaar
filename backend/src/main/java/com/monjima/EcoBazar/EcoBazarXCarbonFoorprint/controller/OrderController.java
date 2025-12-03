package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.CreateOrderRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.OrderResponse;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.OrderItem;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.OrderStatus;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService service;

    // CREATE ORDER
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest req) {
        return ResponseEntity.ok(service.createOrder(req));
    }

    // GET ORDERS FOR BUYER
    @GetMapping("/buyer/{buyerId}")
    public List<OrderResponse> getOrdersForBuyer(@PathVariable String buyerId) {
        return service.getOrdersByBuyer(buyerId);
    }

    // GET ORDERS FOR SELLER
    @GetMapping("/seller/{sellerId}")
    public List<OrderResponse> getOrdersForSeller(@PathVariable String sellerId) {
        return service.getOrdersBySeller(sellerId);
    }

    // GET ORDER BY ID
    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable String id) {
        return service.getOrderById(id);
    }

    // CANCEL ORDER
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(service.cancelOrder(orderId));
    }

    // RETURN ORDER
    @PutMapping("/return/{orderId}")
    public ResponseEntity<OrderResponse> returnOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(service.returnOrder(orderId));
    }

    // GET ONE ITEM FOR SELLER TRACKING
    @GetMapping("/track/{orderId}/{sellerId}/{productId}")
    public ResponseEntity<OrderItem> trackItem(
            @PathVariable String orderId,
            @PathVariable String sellerId,
            @PathVariable String productId
    ) {
        return ResponseEntity.ok(
                service.getOrderItemForSeller(orderId, sellerId, productId)
        );
    }

    // UPDATE SELLER STATUS FOR SPECIFIC ITEM
    @PutMapping("/update-status/{orderId}/{sellerId}/{productId}")
    public ResponseEntity<String> updateStatus(
            @PathVariable String orderId,
            @PathVariable String sellerId,
            @PathVariable String productId,
            @RequestParam OrderStatus status
    ) {
        service.updateItemStatus(orderId, sellerId, productId, status);
        return ResponseEntity.ok("Seller status updated to " + status);
    }
}
