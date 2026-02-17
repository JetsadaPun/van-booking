package com.easyvan.van_booking_service.repository;

import com.easyvan.van_booking_service.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StationRepository extends JpaRepository<Station, Long> {
    List<Station> findByProvince(String province);
}
