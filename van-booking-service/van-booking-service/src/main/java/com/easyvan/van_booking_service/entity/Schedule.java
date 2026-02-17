package com.easyvan.van_booking_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Data
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // เชื่อมโยงกับตารางเส้นทาง (Routes)
    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    // เชื่อมโยงกับตารางผู้ใช้ เพื่อระบุคนขับ (Driver)
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    // เชื่อมโยงกับตารางรถยนต์ (Vehicles)
    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    // สถานะรอบรถ: 'AVAILABLE', 'FULL', 'CANCELLED'
    @Column(name = "status", length = 20)
    private String status = "AVAILABLE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}