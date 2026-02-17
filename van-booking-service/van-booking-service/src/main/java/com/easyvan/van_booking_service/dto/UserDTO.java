package com.easyvan.van_booking_service.dto;

import lombok.Data;

@Data
public class UserDTO {
    private String username;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String role; // PASSENGER, DRIVER, ADMIN
}