package com.easyvan.van_booking_service.repository;

import com.easyvan.van_booking_service.entity.DriverReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverReportRepository extends JpaRepository<DriverReport, Long> {
    List<DriverReport> findByDriverId(Long driverId);
    List<DriverReport> findAllByOrderByCreatedAtDesc();
}
