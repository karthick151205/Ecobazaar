package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.LoginRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.LoginResponse;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.SignUpRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.entity.User;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.repository.UserRepository;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }


    // ---------------- SIGNUP ----------------
    public String signup(SignUpRequest req) {

        String role = (req.getRole() == null ? "BUYER" : req.getRole()).toUpperCase();

        if (userRepository.findByEmailAndRole(req.getEmail(), role).isPresent()) {
            return "User already exists with this email & role";
        }

        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setRole(role);

        u.setApproved(!role.equals("SELLER")); // sellers need approval
    
        userRepository.save(u);
        return "User registered successfully";
    }


    // ---------------- LOGIN ----------------
    public LoginResponse login(LoginRequest req) {

        if (req.getEmail() == null || req.getPassword() == null || req.getRole() == null) {
            return null;
        }

        String role = req.getRole().toUpperCase();

        // ------- FIND USER -------
        Optional<User> optUser = userRepository.findByEmailAndRole(req.getEmail(), role);

        if (optUser.isEmpty()) {
            return null;
        }

        User user = optUser.get();

        // ------- CHECK PASSWORD -------
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return null;
        }

        // ------- CHECK SELLER APPROVAL -------
        if (role.equals("SELLER") && !user.isApproved()) {
            return null;
        }

        // ------- JWT TOKEN -------
        String token = jwtUtil.generateToken(user.getEmail());

        // ------- RETURN COMPLETE RESPONSE -------
        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }
}
