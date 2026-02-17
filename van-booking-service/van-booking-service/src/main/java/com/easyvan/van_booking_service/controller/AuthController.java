package com.easyvan.van_booking_service.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import com.easyvan.van_booking_service.dto.UserDTO;
import com.easyvan.van_booking_service.repository.UserRepository;
import com.easyvan.van_booking_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final String jwtSecret;

    @Autowired
    public AuthController(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserService userService,
            @Value("${jwt.secret}") String jwtSecret) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
        this.jwtSecret = jwtSecret;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO dto) {
        try {
            // ส่ง DTO ไปให้ Service จัดการทั้งหมด (ทั้งเช็คซ้ำ, Hash Password และบันทึก)
            userService.registerUser(dto);
            return ResponseEntity.ok("ลงทะเบียนสำเร็จ");
        } catch (RuntimeException e) {
            // รับข้อความ Error จาก Service เช่น "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO dto) {
        String loginInput = dto.getEmail() != null ? dto.getEmail() : dto.getUsername();

        return userRepository.findByEmailIgnoreCase(loginInput)
                .or(() -> userRepository.findByUsername(loginInput))
                .filter(u -> passwordEncoder.matches(dto.getPassword(), u.getPassword()))
                .map(u -> {
                    String token = Jwts.builder()
                            .setSubject(u.getEmail())
                            .claim("role", u.getRole())
                            .setIssuedAt(new Date())
                            .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                            .compact();

                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);

                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", u.getId());
                    userMap.put("username", u.getUsername());
                    userMap.put("email", u.getEmail());
                    userMap.put("fullName", u.getFullName());
                    userMap.put("role", u.getRole());
                    userMap.put("phoneNumber", u.getPhoneNumber());

                    response.put("user", userMap);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", "อีเมลหรือรหัสผ่านไม่ถูกต้อง")));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody UserDTO dto) {
        try {
            userService.updateUser(userId, dto);
            return ResponseEntity.ok("อัปเดตข้อมูลสำเร็จ");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            userService.forgotPassword(request.get("email"));
            return ResponseEntity.ok("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            userService.resetPassword(request.get("token"), request.get("newPassword"));
            return ResponseEntity.ok("รีเซ็ตรหัสผ่านสำเร็จ");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}