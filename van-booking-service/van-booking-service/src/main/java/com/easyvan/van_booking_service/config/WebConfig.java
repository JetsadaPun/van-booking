package com.easyvan.van_booking_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // อนุญาตทุก Path ที่ขึ้นต้นด้วย /api/
                .allowedOrigins("http://localhost:3000") // ระบุ URL ของ Next.js
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // ระบุ Method ที่อนุญาต
                .allowedHeaders("*") // อนุญาตทุก Header
                .allowCredentials(true); // อนุญาตการส่ง Cookie หรือ Auth Header
    }
}