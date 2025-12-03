package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.CartItem;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    // ➕ ADD TO CART
    @PostMapping("/add")
    public CartItem addToCart(@RequestBody CartItem item) {

        // Check if item already exists in user's cart
        List<CartItem> existingItems =
                cartRepository.findByBuyerIdAndProductId(item.getBuyerId(), item.getProductId());

        if (!existingItems.isEmpty()) {
            CartItem existing = existingItems.get(0);
            existing.setQuantity(existing.getQuantity() + 1);
            return cartRepository.save(existing);
        }

        if (item.getQuantity() == null || item.getQuantity() < 1) {
            item.setQuantity(1);
        }

        return cartRepository.save(item);
    }

    // 🛒 GET CART ITEMS
    @GetMapping("/{buyerId}")
    public List<CartItem> getCart(@PathVariable String buyerId) {
        return cartRepository.findByBuyerId(buyerId);
    }

    // ❌ DELETE CART ITEM
    @DeleteMapping("/delete/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable String cartItemId) {

        if (!cartRepository.existsById(cartItemId)) {
            return ResponseEntity.notFound().build();
        }

        cartRepository.deleteById(cartItemId);
        return ResponseEntity.noContent().build();
    }

    // 🔄 UPDATE QUANTITY
    @PutMapping("/{cartItemId}/quantity")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable String cartItemId,
            @RequestBody Map<String, Integer> body) {

        Integer quantity = body.get("quantity");
        if (quantity == null || quantity < 1) {
            quantity = 1;
        }

        CartItem item = cartRepository.findById(cartItemId).orElse(null);

        if (item == null) {
            return ResponseEntity.notFound().build();
        }

        item.setQuantity(quantity);
        return ResponseEntity.ok(cartRepository.save(item));
    }
}
