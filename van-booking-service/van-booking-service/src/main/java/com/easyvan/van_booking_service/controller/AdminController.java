package com.easyvan.van_booking_service.controller;

import com.easyvan.van_booking_service.entity.User;
import com.easyvan.van_booking_service.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/drivers")
    public ResponseEntity<User> createDriver(@RequestBody User driverData) {
        return ResponseEntity.ok(adminService.createDriver(driverData));
    }

    @PostMapping("/drivers/import")
    public ResponseEntity<List<User>> importDrivers(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminService.importDriversFromCsv(file));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<User>> getAllDrivers() {
        return ResponseEntity.ok(adminService.getAllDrivers());
    }

    @PutMapping("/drivers/{id}")
    public ResponseEntity<User> updateDriver(@PathVariable Long id, @RequestBody User driverData) {
        return ResponseEntity.ok(adminService.updateDriver(id, driverData));
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        adminService.deleteDriver(id);
        return ResponseEntity.ok().build();
    }

    // --- Station Management ---
    @PostMapping("/stations")
    public ResponseEntity<com.easyvan.van_booking_service.entity.Station> createStation(
            @RequestBody com.easyvan.van_booking_service.entity.Station station) {
        return ResponseEntity.ok(adminService.createStation(station));
    }

    @GetMapping("/stations")
    public ResponseEntity<List<com.easyvan.van_booking_service.entity.Station>> getAllStations() {
        return ResponseEntity.ok(adminService.getAllStations());
    }

    @PutMapping("/stations/{id}")
    public ResponseEntity<com.easyvan.van_booking_service.entity.Station> updateStation(@PathVariable Long id,
            @RequestBody com.easyvan.van_booking_service.entity.Station station) {
        return ResponseEntity.ok(adminService.updateStation(id, station));
    }

    @DeleteMapping("/stations/{id}")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        adminService.deleteStation(id);
        return ResponseEntity.ok().build();
    }

    // --- Route Management ---
    @PostMapping("/routes")
    public ResponseEntity<com.easyvan.van_booking_service.entity.Route> createRoute(
            @RequestBody com.easyvan.van_booking_service.entity.Route route) {
        return ResponseEntity.ok(adminService.createRoute(route));
    }

    @GetMapping("/routes")
    public ResponseEntity<List<com.easyvan.van_booking_service.entity.Route>> getAllRoutes() {
        return ResponseEntity.ok(adminService.getAllRoutes());
    }

    @PutMapping("/routes/{id}")
    public ResponseEntity<com.easyvan.van_booking_service.entity.Route> updateRoute(@PathVariable Long id,
            @RequestBody com.easyvan.van_booking_service.entity.Route route) {
        return ResponseEntity.ok(adminService.updateRoute(id, route));
    }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {
        adminService.deleteRoute(id);
        return ResponseEntity.ok().build();
    }

    // --- Schedule (Assignment) Management ---
    @PostMapping("/schedules")
    public ResponseEntity<com.easyvan.van_booking_service.entity.Schedule> createSchedule(
            @RequestBody com.easyvan.van_booking_service.entity.Schedule schedule) {
        return ResponseEntity.ok(adminService.createSchedule(schedule));
    }

    @GetMapping("/schedules")
    public ResponseEntity<List<com.easyvan.van_booking_service.entity.Schedule>> getAllSchedules() {
        return ResponseEntity.ok(adminService.getAllSchedules());
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        adminService.deleteSchedule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<com.easyvan.van_booking_service.entity.Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(adminService.getAllVehicles());
    }
}
