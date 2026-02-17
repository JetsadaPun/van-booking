package com.easyvan.van_booking_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "routes")
@Data
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "origin_station_id")
    private Station originStation;

    @ManyToOne
    @JoinColumn(name = "destination_station_id")
    private Station destinationStation;

    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    @Column(name = "is_active")
    private Boolean isActive = true;
}