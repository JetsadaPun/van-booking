package com.easyvan.van_booking_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Long routeId;
    private LocalDateTime departureTime;
    private Long userId;
    private Integer seatNumber;
    private String pickupPoint;
    private Double pickupLat;
    private Double pickupLng;
    private String dropoffPoint;
    private Double dropoffLat;
    private Double dropoffLng;
    private String contactPhone;
    private String remark;
    private Double totalPrice;
}
