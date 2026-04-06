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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Slip2GoService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${slip2go.api.secret}")
    private String apiSecret;

    @Value("${slip2go.api.url}")
    private String apiUrl;

    public Slip2GoResponseDTO verifySlip(MultipartFile file) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        // Updated to use "Authorization: Bearer <KEY>" as per documentation screenshot
        headers.set("Authorization", "Bearer " + apiSecret);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        
        // 1. Add file part
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "slip.jpg";
            }
        };

        HttpHeaders filePartHeaders = new HttpHeaders();
        String contentType = file.getContentType();
        if (contentType == null) {
            contentType = MediaType.IMAGE_JPEG_VALUE;
        }
        filePartHeaders.setContentType(MediaType.parseMediaType(contentType));
        HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(fileResource, filePartHeaders);
        body.add("file", filePart);

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForObject(apiUrl, entity, Slip2GoResponseDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Error verifying slip with Slip2Go: " + e.getMessage());
        }
    }
}
