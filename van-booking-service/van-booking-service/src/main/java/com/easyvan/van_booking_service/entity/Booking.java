package com.easyvan.van_booking_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private Schedule schedule;

    private Integer seatNumber;
    private String status;
    private Double totalPrice;

    @Column(name = "pickup_point", nullable = false)
    private String pickupPoint;

    @Column(name = "pickup_lat")
    private Double pickupLat;

    @Column(name = "pickup_lng")
    private Double pickupLng;

    @Column(name = "dropoff_point")
    private String dropoffPoint;

    @Column(name = "dropoff_lat")
    private Double dropoffLat;

    @Column(name = "dropoff_lng")
    private Double dropoffLng;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String remark;

    private String slipImageUrl;
    private String transactionId;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Route getRoute() {
        return this.schedule != null ? this.schedule.getRoute() : null;
    }
}
