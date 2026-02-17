package com.easyvan.van_booking_service.repository;

import com.easyvan.van_booking_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ฟีเจอร์ดูประวัติการจอง: ค้นหาการจองทั้งหมดของข้าพเจ้า (User)
    List<Booking> findByUserId(Long userId);

    // ตรวจสอบว่าที่นั่งในรอบรถนั้นๆ ถูกจองไปแล้วจริงๆ ใน DB หรือไม่
    // (เพื่อความชัวร์จาก Redis)
    boolean existsByScheduleIdAndSeatNumberAndStatus(Long scheduleId, Integer seatNumber, String status);

    List<Booking> findByScheduleId(Long scheduleId);

    long countByScheduleId(Long scheduleId);

    // ค้นหาการจองทั้งหมดที่อยู่ในรอบรถที่ขับโดย driverId นี้
    List<Booking> findByScheduleDriverId(Long driverId);

}