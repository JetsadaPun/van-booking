package com.easyvan.van_booking_service.controller;

import com.easyvan.van_booking_service.dto.BookingRequest;
import com.easyvan.van_booking_service.entity.Booking;
import com.easyvan.van_booking_service.repository.BookingRepository;
import com.easyvan.van_booking_service.service.BookingService;
import com.easyvan.van_booking_service.repository.SchedulesRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.easyvan.van_booking_service.service.DriverService;

import java.util.List;

@RestController
@RequestMapping("/api/driver")
public class DriverController {
    @Autowired
    private DriverService driverService;

    @PostMapping("/verify-pickup/{bookingId}")
    public ResponseEntity<String> verifyPickup(@PathVariable Long bookingId) {
        try {
            driverService.verifyPickup(bookingId);
            return ResponseEntity.ok("ยืนยันการรับผู้โดยสารสำเร็จ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("เกิดข้อผิดพลาด: " + e.getMessage());
        }
    }

    @GetMapping("/schedules/{driverId}")
    public ResponseEntity<List<com.easyvan.van_booking_service.dto.DriverScheduleDTO>> getDriverSchedules(
            @PathVariable Long driverId) {
        return ResponseEntity.ok(driverService.getDriverSchedules(driverId));
    }

    @GetMapping("/schedules/{scheduleId}/bookings")
    public ResponseEntity<List<Booking>> getScheduleBookings(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(driverService.getBookingsBySchedule(scheduleId));
    }
}