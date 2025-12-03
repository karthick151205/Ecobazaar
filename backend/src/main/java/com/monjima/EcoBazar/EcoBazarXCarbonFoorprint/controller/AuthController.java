package com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.controller;

import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.LoginRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.LoginResponse;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.dto.SignUpRequest;
import com.monjima.EcoBazar.EcoBazarXCarbonFoorprint.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService svc) {
        this.userService = svc;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest req) {
        String msg = userService.signup(req);
        return ResponseEntity.ok(msg);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        LoginResponse res = userService.login(req);
        if (res == null) {
            return ResponseEntity.status(401).body("Invalid email or password or role");
        }
        return ResponseEntity.ok(res);
    }
}
