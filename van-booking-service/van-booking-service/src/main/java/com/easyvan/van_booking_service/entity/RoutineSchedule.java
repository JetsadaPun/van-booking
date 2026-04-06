package com.easyvan.van_booking_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Table(name = "routine_schedules")
@Data
public class RoutineSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "departure_time", nullable = false)
    private LocalTime departureTime;

    // สถานะ: ACTIVE, INACTIVE
    @Column(name = "status", length = 20)
    private String status = "ACTIVE";
}
