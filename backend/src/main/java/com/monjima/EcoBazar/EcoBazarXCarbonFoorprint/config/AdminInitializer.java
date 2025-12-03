package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.config;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.User;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String adminEmail = "admin@ecobazaar.com";

        boolean exists = userRepository
                .findAllByEmail(adminEmail)
                .stream()
                .anyMatch(u -> "ADMIN".equals(u.getRole()));

        if (!exists) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setApproved(true);
            userRepository.save(admin);
            System.out.println("✅ Default admin created: admin@ecobazaar.com / admin123");
        } else {
            System.out.println("✅ Admin already exists.");
        }
    }
}
