package com.easyvan.van_booking_service.repository;

import com.easyvan.van_booking_service.entity.RoutineSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoutineScheduleRepository extends JpaRepository<RoutineSchedule, Long> {
    List<RoutineSchedule> findByRouteId(Long routeId);
    List<RoutineSchedule> findByStatus(String status);
}
