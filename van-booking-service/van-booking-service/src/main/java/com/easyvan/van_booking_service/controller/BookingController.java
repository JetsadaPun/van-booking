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

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final SchedulesRepository schedulesRepository;

    @Autowired
    public BookingController(BookingService bookingService, BookingRepository bookingRepository,
            SchedulesRepository schedulesRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.schedulesRepository = schedulesRepository;
    }

    @PostMapping("/reserve")
    public ResponseEntity<String> reserve(@RequestBody BookingRequest bookingRequest) {
        try {
            String result = bookingService.reserveSeatWithLock(bookingRequest);
            if (result.contains("สำเร็จ")) {
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.status(409).body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("เกิดข้อผิดพลาด: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUser(@PathVariable Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    @GetMapping("/booked-seats")
    public List<Integer> getBookedSeats(
            @RequestParam Long routeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime departureTime) {
        return schedulesRepository.findByRouteIdAndDepartureTime(routeId, departureTime)
                .map(schedule -> bookingRepository.findByScheduleId(schedule.getId()).stream()
                        .filter(b -> !"CANCELLED".equals(b.getStatus()) && !"REJECTED".equals(b.getStatus()))
                        .map(Booking::getSeatNumber)
                        .collect(java.util.stream.Collectors.toList()))
                .orElse(java.util.Collections.emptyList());
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok("ยกเลิกการจองสำเร็จ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("เกิดข้อผิดพลาด: " + e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/reschedule")
    public ResponseEntity<String> rescheduleBooking(
            @PathVariable Long bookingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime newDepartureTime) {
        try {
            bookingService.rescheduleBooking(bookingId, newDepartureTime);
            return ResponseEntity.ok("เลื่อนการเดินทางสำเร็จ");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("เกิดข้อผิดพลาด: " + e.getMessage());
        }
    }

}
