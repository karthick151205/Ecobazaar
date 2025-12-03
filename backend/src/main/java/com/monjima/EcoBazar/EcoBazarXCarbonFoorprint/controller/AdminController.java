package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.Product;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.HelpRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.SiteSettings;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.ProductRepository;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.SiteSettingsRepository;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.HelpRequestRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private HelpRequestRepository helpRepo;

    @Autowired
    private SiteSettingsRepository siteSettingsRepository;

    /* --------------------------
       ⭐ PRODUCT MODERATION
       -------------------------- */
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PutMapping("/products/approve/{id}")
    public ResponseEntity<?> approveProduct(@PathVariable String id) {
        Product p = productRepository.findById(id).orElse(null);

        if (p == null) {
            return ResponseEntity.notFound().build();
        }

        p.setApproved(true);
        productRepository.save(p);
        return ResponseEntity.ok("Product approved");
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        productRepository.deleteById(id);
        return ResponseEntity.ok("Product deleted");
    }

    /* --------------------------
       ⭐ HELP MESSAGES
       -------------------------- */
    @PostMapping("/help")
    public ResponseEntity<?> saveHelp(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String message = data.get("message");

        HelpRequest req = new HelpRequest();
        req.setEmail(email);
        req.setMessage(message);

        helpRepo.save(req);
        return ResponseEntity.ok("Help request saved");
    }

    @GetMapping("/help/all")
    public List<HelpRequest> getAllHelp() {
        return helpRepo.findAll();
    }

    @DeleteMapping("/help/delete/{id}")
    public ResponseEntity<?> deleteHelp(@PathVariable String id) {
        helpRepo.deleteById(id);
        return ResponseEntity.ok("Help request deleted");
    }

    @PostMapping("/help/reply")
    public ResponseEntity<?> replyToUser(@RequestBody Map<String, String> data) {

        String id = data.get("id");
        String reply = data.get("reply");

        HelpRequest req = helpRepo.findById(id).orElse(null);

        if (req == null) {
            return ResponseEntity.badRequest().body("Help request not found");
        }

        req.setReply(reply);   // ⭐ Save admin reply
        helpRepo.save(req);

        return ResponseEntity.ok("Reply saved");
    }

    @GetMapping("/help/user/{email}")
    public List<HelpRequest> getHelpByUser(@PathVariable String email) {
        return helpRepo.findByEmail(email);
    }


    /* --------------------------
       ⭐⭐ SITE SETTINGS (ADDED)
       -------------------------- */

    // Helper: Fetch or Create settings document
    private SiteSettings getOrCreateSettings() {
        return siteSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> siteSettingsRepository.save(new SiteSettings()));
    }

    // ⭐ Get Settings
    @GetMapping("/settings")
    public ResponseEntity<SiteSettings> getSettings() {
        SiteSettings settings = getOrCreateSettings();
        return ResponseEntity.ok(settings);
    }

    // ⭐ Update Settings
    @PutMapping("/settings")
    public ResponseEntity<SiteSettings> updateSettings(@RequestBody SiteSettings newSettings) {

        SiteSettings existing = getOrCreateSettings();

        existing.setSiteName(newSettings.getSiteName());
        existing.setMaintenanceMode(newSettings.isMaintenanceMode());
        existing.setAllowUsers(newSettings.isAllowUsers());
        existing.setAllowSellers(newSettings.isAllowSellers());
        existing.setEcoPointsEnabled(newSettings.isEcoPointsEnabled());
        existing.setEcoRate(newSettings.getEcoRate());
        existing.setCodEnabled(newSettings.isCodEnabled());
        existing.setDeliveryCharge(newSettings.getDeliveryCharge());
        existing.setFreeDeliveryMin(newSettings.getFreeDeliveryMin());

        SiteSettings saved = siteSettingsRepository.save(existing);
        return ResponseEntity.ok(saved);
    }
}
