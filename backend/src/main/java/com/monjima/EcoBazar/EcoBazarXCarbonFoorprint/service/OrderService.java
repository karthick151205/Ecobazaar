package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.CreateOrderItemDTO;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.CreateOrderRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.OrderResponse;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.*;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.*;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private CarbonRulesRepository carbonRulesRepo;

    @Autowired
    private UserRepository buyerRepo;

    // Convert String → ObjectId
    private ObjectId toObjectId(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        try {
            return new ObjectId(value);
        } catch (Exception ex) {
            throw new IllegalArgumentException(fieldName + " must be valid ObjectId", ex);
        }
    }

    // =====================================================================
    // CREATE ORDER
    // =====================================================================
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req) {

        Order order = new Order();

        order.setBuyerId(toObjectId(req.getBuyerId(), "buyerId"));
        order.setBuyerName(req.getBuyerName());
        order.setBuyerEmail(req.getBuyerEmail());
        order.setAddress(req.getAddress());
        order.setPaymentMethod(req.getPaymentMethod());

        order.setDeliveryCharge(req.getDeliveryCharge());
        order.setDiscount(req.getDiscount());
        order.setTotalAmount(req.getTotalAmount());

        // Overall order visible status for buyer
        order.setStatus(OrderStatus.CONFIRMED);

        // Items
        List<OrderItem> items = req.getItems().stream()
                .map(this::mapItem)
                .collect(Collectors.toList());

        order.setItems(items);

        // Carbon points
        double totalCarbonPoints = 0;
        for (OrderItem item : items) {
            Product product = productRepo.findById(item.getProductId().toHexString())
                    .orElse(null);

            if (product != null) {
                totalCarbonPoints += product.getEcoPoints() * item.getQuantity();
            }
        }

        order.setTotalCarbonPoints(totalCarbonPoints);

        // Save
        Order saved = repo.save(order);

        // Decrease stock
        for (OrderItem item : items) {
            productRepo.findById(item.getProductId().toHexString())
                    .ifPresent(product -> {
                        product.setStock(Math.max(0, product.getStock() - item.getQuantity()));
                        product.setSold(product.getSold() + item.getQuantity());
                        productRepo.save(product);
                    });
        }

        return new OrderResponse(saved);
    }

    // Map DTO → entity item
    private OrderItem mapItem(CreateOrderItemDTO i) {
        OrderItem oi = new OrderItem();

        oi.setProductId(toObjectId(i.getProductId(), "productId"));
        oi.setSellerId(toObjectId(i.getSellerId(), "sellerId"));
        oi.setProductName(i.getProductName());
        oi.setPrice(i.getPrice());
        oi.setQuantity(i.getQuantity());
        oi.setImageUrl(i.getImageUrl());

        Product p = productRepo.findById(i.getProductId()).orElse(null);
        oi.setCarbonPoints(p != null ? p.getEcoPoints() : 0);

        // Initial statuses
        oi.setStatus(OrderStatus.CONFIRMED);       // buyer item view (optional)
        oi.setSellerStatus(OrderStatus.CONFIRMED); // seller tracker

        return oi;
    }

    // =====================================================================
    // GET ORDERS
    // =====================================================================
    public List<OrderResponse> getOrdersByBuyer(String buyerId) {
        return repo.findByBuyerId(toObjectId(buyerId, "buyerId"))
                .stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersBySeller(String sellerId) {
        return repo.findByItemsSellerId(toObjectId(sellerId, "sellerId"))
                .stream()
                .map(OrderResponse::new)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String id) {
        return new OrderResponse(
                repo.findById(toObjectId(id, "orderId")).orElseThrow()
        );
    }

    // =====================================================================
    // CANCEL ORDER (buyer action)
    // =====================================================================
    @Transactional
    public OrderResponse cancelOrder(String orderId) {

        ObjectId oid = toObjectId(orderId, "orderId");

        Order order = repo.findById(oid)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return new OrderResponse(order);
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            productRepo.findById(item.getProductId().toHexString())
                    .ifPresent(product -> {
                        product.setStock(product.getStock() + item.getQuantity());
                        product.setSold(Math.max(0, product.getSold() - item.getQuantity()));
                        productRepo.save(product);
                    });

            // Also mark sellerStatus as CANCELLED so seller & buyer see same
            item.setSellerStatus(OrderStatus.CANCELLED);
            item.setStatus(OrderStatus.CANCELLED);
        }

        // Reduce eco points
        double ecoPointsToReduce = order.getTotalCarbonPoints();

        buyerRepo.findById(order.getBuyerId().toHexString())
                .ifPresent(buyer -> {
                    double current = buyer.getEcoPoints() == null ? 0 : buyer.getEcoPoints();
                    buyer.setEcoPoints(Math.max(0, current - ecoPointsToReduce));
                    buyerRepo.save(buyer);
                });

        order.setStatus(OrderStatus.CANCELLED);
        repo.save(order);

        return new OrderResponse(order);
    }

    // =====================================================================
    // RETURN ORDER (buyer action)
    // =====================================================================
    @Transactional
    public OrderResponse returnOrder(String orderId) {

        ObjectId oid = toObjectId(orderId, "orderId");

        Order order = repo.findById(oid)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.RETURNED) {
            return new OrderResponse(order);
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            productRepo.findById(item.getProductId().toHexString())
                    .ifPresent(product -> {
                        product.setStock(product.getStock() + item.getQuantity());
                        product.setSold(Math.max(0, product.getSold() - item.getQuantity()));
                        productRepo.save(product);
                    });

            // Mark item statuses as RETURNED
            item.setSellerStatus(OrderStatus.RETURNED);
            item.setStatus(OrderStatus.RETURNED);
        }

        // Reduce eco points
        double ecoPointsToReduce = order.getTotalCarbonPoints();

        buyerRepo.findById(order.getBuyerId().toHexString())
                .ifPresent(buyer -> {
                    double current = buyer.getEcoPoints() == null ? 0 : buyer.getEcoPoints();
                    buyer.setEcoPoints(Math.max(0, current - ecoPointsToReduce));
                    buyerRepo.save(buyer);
                });

        order.setStatus(OrderStatus.RETURNED);
        repo.save(order);

        return new OrderResponse(order);
    }

    // =====================================================================
    // GET SPECIFIC ITEM FOR SELLER
    // =====================================================================
    public OrderItem getOrderItemForSeller(String orderId, String sellerId, String productId) {

        Order order = repo.findById(toObjectId(orderId, "orderId"))
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return order.getItems().stream()
                .filter(i ->
                        i.getSellerId().toHexString().equals(sellerId)
                                && i.getProductId().toHexString().equals(productId)
                )
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order item not found for seller"));
    }

    // =====================================================================
    // UPDATE SELLER STATUS ONLY (NOT BUYER'S GLOBAL ORDER STATUS)
    // =====================================================================
    public void updateItemStatus(String orderId, String sellerId, String productId, OrderStatus newStatus) {

        Order order = repo.findById(toObjectId(orderId, "orderId"))
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.getItems().forEach(item -> {
            if (item.getSellerId().toHexString().equals(sellerId)
                    && item.getProductId().toHexString().equals(productId)) {

                item.setSellerStatus(newStatus);  // 🔥 Only sellerStatus is controlled by seller
            }
        });

        repo.save(order);
    }
}
