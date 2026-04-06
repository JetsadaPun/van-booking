package com.easyvan.van_booking_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "driver_reports")
@Data
public class DriverReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    @Column(nullable = false, length = 1000)
    private String reason;

    private Integer rating; // 1-5 stars

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.PENDING;

    public enum ReportStatus {
        PENDING, REVIEWED, RESOLVED
    }
}
