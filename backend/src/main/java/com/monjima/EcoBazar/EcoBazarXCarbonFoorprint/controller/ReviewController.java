package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.ReviewRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Product;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Review;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.ProductRepository;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.ReviewRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewController(ReviewRepository reviewRepository,
                            ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    // -----------------------------------------------
    // 1️⃣ Get all reviews for a product
    // -----------------------------------------------
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<Review>> getReviewsForProduct(@PathVariable String productId) {
        return ResponseEntity.ok(reviewRepository.findByProductId(productId));
    }

    // -----------------------------------------------
    // 2️⃣ Add review for product
    // -----------------------------------------------
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<?> addReviewForProduct(
            @PathVariable String productId,
            @RequestBody ReviewRequest rq
    ) {
        if (rq.getRating() < 1 || rq.getRating() > 5) {
            return ResponseEntity.badRequest().body("Rating must be 1-5");
        }
        if (rq.getComment() == null || rq.getComment().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Comment cannot be empty");
        }

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        Review review = new Review();
        review.setProductId(productId);
        review.setBuyerId(rq.getBuyerId());
        review.setBuyerName(rq.getBuyerName());
        review.setRating(rq.getRating());
        review.setComment(rq.getComment());
        review.setReply((String) null);  // seller reply not added yet

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    // -----------------------------------------------
    // 3️⃣ Get all reviews of all products from a seller
    // -----------------------------------------------
    @GetMapping("/seller/{sellerId}/reviews")
    public ResponseEntity<List<Review>> getReviewsForSeller(@PathVariable String sellerId) {

        List<Product> products = productRepository.findBySellerId(sellerId);

        List<Review> allReviews = new ArrayList<>();
        for (Product p : products) {
            allReviews.addAll(reviewRepository.findByProductId(p.getId()));
        }

        return ResponseEntity.ok(allReviews);
    }

    // -----------------------------------------------
    // 4️⃣ Seller replies to a review
    // -----------------------------------------------
    @PutMapping("/reviews/{reviewId}/reply")
public ResponseEntity<?> replyToReview(
        @PathVariable String reviewId,
        @RequestBody Map<String, String> body
) {
    String reply = body.get("reply");

    if (reply == null || reply.trim().isEmpty()) {
        return ResponseEntity.badRequest().body("Reply cannot be empty");
    }

    return reviewRepository.findById(reviewId)
            .map(review -> {
                review.setReply(reply);           // ✅ now valid
                return ResponseEntity.ok(reviewRepository.save(review));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
}
}
