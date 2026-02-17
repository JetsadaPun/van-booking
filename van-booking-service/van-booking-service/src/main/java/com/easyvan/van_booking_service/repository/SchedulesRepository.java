package com.easyvan.van_booking_service.repository;

import com.easyvan.van_booking_service.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchedulesRepository extends JpaRepository<Schedule, Long> {
    // ดึงรอบรถที่ยังไม่เต็มหรือยังไม่ถูกยกเลิก
    List<Schedule> findByStatus(String status);

    List<Schedule> findByRouteIdAndStatus(Long routeId, String status);

    java.util.Optional<Schedule> findByRouteIdAndDepartureTime(Long routeId, java.time.LocalDateTime departureTime);

    List<Schedule> findByDriverId(Long driverId);
}