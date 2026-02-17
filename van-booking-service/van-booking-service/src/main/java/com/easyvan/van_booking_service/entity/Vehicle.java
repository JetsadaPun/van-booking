package com.easyvan.van_booking_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String plateNumber;
    private String model;
    private Integer capacity = 13;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
}