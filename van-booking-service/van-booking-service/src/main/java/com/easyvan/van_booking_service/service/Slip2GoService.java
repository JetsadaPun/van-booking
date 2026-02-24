package com.easyvan.van_booking_service.service;

import com.easyvan.van_booking_service.dto.Slip2GoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Slip2GoService {

    private final RestTemplate restTemplate;

    @Value("${slip2go.api.secret}")
    private String apiSecret;

    @Value("${slip2go.api.url}")
    private String apiUrl;

    public Slip2GoResponseDTO verifySlip(MultipartFile file) throws Exception {
        byte[] imageBytes = file.getBytes();
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-secret", apiSecret);

        Map<String, Object> body = new HashMap<>();
        body.put("image", base64Image); // Slip2Go typically expects base64 or URL

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForObject(apiUrl, entity, Slip2GoResponseDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Error verifying slip with Slip2Go: " + e.getMessage());
        }
    }
}
