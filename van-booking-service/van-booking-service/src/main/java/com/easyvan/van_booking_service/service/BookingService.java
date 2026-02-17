package com.easyvan.van_booking_service.service;

import com.easyvan.van_booking_service.dto.BookingRequest;
import com.easyvan.van_booking_service.entity.Booking;
import com.easyvan.van_booking_service.entity.Schedule;
import com.easyvan.van_booking_service.entity.Route;
import com.easyvan.van_booking_service.repository.BookingRepository;
import com.easyvan.van_booking_service.repository.RouteRepository;
import com.easyvan.van_booking_service.repository.SchedulesRepository;
import com.easyvan.van_booking_service.repository.UserRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SchedulesRepository schedulesRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    public BookingService(BookingRepository bookingRepository,
            SchedulesRepository schedulesRepository,
            RouteRepository routeRepository,
            UserRepository userRepository,
            StringRedisTemplate redisTemplate) {
        this.bookingRepository = bookingRepository;
        this.schedulesRepository = schedulesRepository;
        this.routeRepository = routeRepository;
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
    }

    public String reserveSeatWithLock(BookingRequest request) {
        // 1. หาหรือสร้าง Schedule จริงในฐานข้อมูลตาม Route และ เวลาที่เลือก (ใช้
        // Repository แทน findAll)
        Schedule schedule = schedulesRepository
                .findByRouteIdAndDepartureTime(request.getRouteId(), request.getDepartureTime())
                .orElseGet(() -> {
                    Route route = routeRepository.findById(request.getRouteId())
                            .orElseThrow(() -> new RuntimeException("ไม่พบเส้นทางที่ระบุ"));
                    Schedule newSch = new Schedule();
                    newSch.setRoute(route);
                    newSch.setDepartureTime(request.getDepartureTime());
                    newSch.setStatus("AVAILABLE");
                    return schedulesRepository.save(newSch);
                });

        // 2. จัดการเรื่อง Lock ใน Redis (พร้อมระบบ Fallback หากไม่มี Redis)
        String lockKey = "lock:seat:" + schedule.getId() + ":" + request.getSeatNumber();
        boolean isLocked = false;

        try {
            Boolean lockResult = redisTemplate.opsForValue()
                    .setIfAbsent(lockKey, "LOCKED", Duration.ofMinutes(10));
            isLocked = Boolean.TRUE.equals(lockResult);
        } catch (Exception e) {
            // Log warning (could use a logger here)
            // Fallback: ตรวจสอบจากตาราง bookings (เช็คทั้ง CONFIRMED และ PENDING)
            List<Booking> existingBookings = bookingRepository.findByScheduleId(schedule.getId());
            boolean isSeatTaken = existingBookings.stream()
                    .anyMatch(b -> b.getSeatNumber().equals(request.getSeatNumber()) &&
                            ("CONFIRMED".equals(b.getStatus()) || "PENDING".equals(b.getStatus())));
            isLocked = !isSeatTaken;
        }

        if (isLocked) {
            try {
                Booking booking = new Booking();
                booking.setSchedule(schedule);
                booking.setSeatNumber(request.getSeatNumber());
                booking.setPickupPoint(request.getPickupPoint());
                booking.setPickupLat(request.getPickupLat());
                booking.setPickupLng(request.getPickupLng());
                booking.setDropoffPoint(request.getDropoffPoint());
                booking.setDropoffLat(request.getDropoffLat());
                booking.setDropoffLng(request.getDropoffLng());
                booking.setContactPhone(request.getContactPhone());
                booking.setRemark(request.getRemark());
                booking.setTotalPrice(request.getTotalPrice());
                booking.setStatus("PENDING");

                if (request.getUserId() != null) {
                    userRepository.findById(request.getUserId()).ifPresent(booking::setUser);
                }

                bookingRepository.save(booking);
                return "จองสำเร็จ กรุณาชำระเงินเพื่อยืนยันมัดจำที่นั่ง";
            } catch (Exception e) {
                redisTemplate.delete(lockKey);
                throw new RuntimeException("เกิดข้อผิดพลาดในการบันทึกข้อมูลการจอง: " + e.getMessage());
            }
        } else {
            return "ที่นั่งนี้มีผู้ใช้งานท่านอื่นกำลังดำเนินการจองอยู่ หรือไม่ว่างในขณะนี้";
        }
    }

    public void confirmPayment(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการจอง"));

        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);

        try {
            String lockKey = "lock:seat:" + booking.getSchedule().getId() + ":" + booking.getSeatNumber();
            redisTemplate.delete(lockKey);
        } catch (Exception e) {
            System.err.println("Warning: Redis unavailable during payment confirmation: " + e.getMessage());
        }
    }

    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการจอง"));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("รายการนี้ถูกยกเลิกไปแล้ว");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        try {
            String lockKey = "lock:seat:" + booking.getSchedule().getId() + ":" + booking.getSeatNumber();
            redisTemplate.delete(lockKey);
        } catch (Exception e) {
            System.err.println("Warning: Redis unavailable during booking cancellation: " + e.getMessage());
        }
    }

    public void rescheduleBooking(Long bookingId, java.time.LocalDateTime newDepartureTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการจอง"));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("ไม่สามารถเปลี่ยนแปลงรายการที่ถูกยกเลิกแล้วได้");
        }

        // 1. Find or create new Schedule
        Schedule newSchedule = schedulesRepository
                .findByRouteIdAndDepartureTime(booking.getSchedule().getRoute().getId(), newDepartureTime)
                .orElseGet(() -> {
                    Route route = routeRepository.findById(booking.getSchedule().getRoute().getId())
                            .orElseThrow(() -> new RuntimeException("ไม่พบเส้นทางที่ระบุ"));
                    Schedule newSch = new Schedule();
                    newSch.setRoute(route);
                    newSch.setDepartureTime(newDepartureTime);
                    newSch.setStatus("AVAILABLE");
                    return schedulesRepository.save(newSch);
                });

        // 2. Check availability on new schedule (same seat)
        boolean isSeatTaken = bookingRepository.findByScheduleId(newSchedule.getId()).stream()
                .anyMatch(b -> b.getSeatNumber().equals(booking.getSeatNumber()) &&
                        ("CONFIRMED".equals(b.getStatus()) || "PENDING".equals(b.getStatus())));

        if (isSeatTaken) {
            throw new RuntimeException("ที่นั่งเดิมไม่ว่างในรอบเวลาใหม่ กรุณาเลือกที่นั่งอื่นหรือรอบเวลาอื่น");
        }

        // 3. Update Booking
        // Unlock old seat
        try {
            String oldLockKey = "lock:seat:" + booking.getSchedule().getId() + ":" + booking.getSeatNumber();
            redisTemplate.delete(oldLockKey);
        } catch (Exception e) {
            System.err.println("Warning: Redis unavailable during rescheduling (unlock old): " + e.getMessage());
        }

        booking.setSchedule(newSchedule);
        bookingRepository.save(booking);
    }
}