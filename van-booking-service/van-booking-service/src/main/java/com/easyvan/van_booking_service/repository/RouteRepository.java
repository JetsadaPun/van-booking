package com.easyvan.van_booking_service.repository;

import com.easyvan.van_booking_service.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByIsActiveTrue();
}
