package com.easyvan.van_booking_service.controller;

import com.easyvan.van_booking_service.entity.Station;
import com.easyvan.van_booking_service.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "http://localhost:3000")
public class StationController {

    private final StationRepository stationRepository;

    @Autowired
    public StationController(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    @GetMapping("/province/{province}")
    public List<Station> getStationsByProvince(@PathVariable String province) {
        return stationRepository.findByProvince(province);
    }
}
