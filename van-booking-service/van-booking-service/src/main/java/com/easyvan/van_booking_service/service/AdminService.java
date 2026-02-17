package com.easyvan.van_booking_service.service;

import com.easyvan.van_booking_service.entity.User;
import com.easyvan.van_booking_service.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.easyvan.van_booking_service.repository.StationRepository stationRepository;
    private final com.easyvan.van_booking_service.repository.RouteRepository routeRepository;
    private final com.easyvan.van_booking_service.repository.SchedulesRepository schedulesRepository;
    private final com.easyvan.van_booking_service.repository.VehicleRepository vehicleRepository;

    public User createDriver(User driverData) {
        if (userRepository.existsByUsername(driverData.getUsername())) {
            throw new RuntimeException("ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว");
        }
        if (driverData.getEmail() != null && userRepository.findByEmailIgnoreCase(driverData.getEmail()).isPresent()) {
            throw new RuntimeException("อีเมลนี้ถูกใช้งานแล้ว");
        }
        driverData.setRole("DRIVER");
        driverData.setPassword(passwordEncoder.encode(driverData.getPassword()));
        return userRepository.save(driverData);
    }

    public List<User> importDriversFromCsv(MultipartFile file) {
        List<User> users = new ArrayList<>();
        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"))) {
            CSVReader csvReader = new CSVReader(reader);
            String[] nextRecord;
            boolean firstRow = true;

            while ((nextRecord = csvReader.readNext()) != null) {
                if (firstRow) { // Skip header
                    firstRow = false;
                    continue;
                }

                // Format: username, email, password, fullName, phoneNumber
                if (nextRecord.length >= 5) {
                    String username = nextRecord[0].trim();
                    String email = nextRecord[1].trim();

                    if (userRepository.existsByUsername(username)
                            || userRepository.findByEmailIgnoreCase(email).isPresent())
                        continue;

                    User user = new User();
                    user.setUsername(username);
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode(nextRecord[2].trim()));
                    user.setFullName(nextRecord[3].trim());
                    user.setPhoneNumber(nextRecord[4].trim());
                    user.setRole("DRIVER");
                    users.add(user);
                }
            }
            return userRepository.saveAll(users);
        } catch (Exception e) {
            throw new RuntimeException("เกิดข้อผิดพลาดในการประมวลผลไฟล์ CSV: " + e.getMessage());
        }
    }

    public User updateDriver(Long id, User driverData) {
        User driver = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลคนขับรถ"));

        driver.setFullName(driverData.getFullName());
        driver.setPhoneNumber(driverData.getPhoneNumber());
        driver.setEmail(driverData.getEmail());

        if (driverData.getPassword() != null && !driverData.getPassword().isEmpty()) {
            driver.setPassword(passwordEncoder.encode(driverData.getPassword()));
        }

        return userRepository.save(driver);
    }

    public void deleteDriver(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getAllDrivers() {
        return userRepository.findAll().stream()
                .filter(u -> "DRIVER".equals(u.getRole()))
                .toList();
    }

    // --- Station Management ---
    public com.easyvan.van_booking_service.entity.Station createStation(
            com.easyvan.van_booking_service.entity.Station station) {
        return stationRepository.save(station);
    }

    public List<com.easyvan.van_booking_service.entity.Station> getAllStations() {
        return stationRepository.findAll();
    }

    public com.easyvan.van_booking_service.entity.Station updateStation(Long id,
            com.easyvan.van_booking_service.entity.Station data) {
        com.easyvan.van_booking_service.entity.Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลสถานี"));
        station.setStationName(data.getStationName());
        station.setProvince(data.getProvince());
        station.setIsMainHub(data.getIsMainHub());
        return stationRepository.save(station);
    }

    public void deleteStation(Long id) {
        stationRepository.deleteById(id);
    }

    // --- Route Management ---
    public com.easyvan.van_booking_service.entity.Route createRoute(
            com.easyvan.van_booking_service.entity.Route route) {
        return routeRepository.save(route);
    }

    public List<com.easyvan.van_booking_service.entity.Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public com.easyvan.van_booking_service.entity.Route updateRoute(Long id,
            com.easyvan.van_booking_service.entity.Route data) {
        com.easyvan.van_booking_service.entity.Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลเส้นทาง"));
        route.setOriginStation(data.getOriginStation());
        route.setDestinationStation(data.getDestinationStation());
        route.setBasePrice(data.getBasePrice());
        route.setEstimatedDuration(data.getEstimatedDuration());
        route.setIsActive(data.getIsActive());
        return routeRepository.save(route);
    }

    public void deleteRoute(Long id) {
        routeRepository.deleteById(id);
    }

    // --- Schedule (Assignment) Management ---
    public com.easyvan.van_booking_service.entity.Schedule createSchedule(
            com.easyvan.van_booking_service.entity.Schedule schedule) {
        return schedulesRepository.save(schedule);
    }

    public List<com.easyvan.van_booking_service.entity.Schedule> getAllSchedules() {
        return schedulesRepository.findAll();
    }

    public void deleteSchedule(Long id) {
        schedulesRepository.deleteById(id);
    }

    public List<com.easyvan.van_booking_service.entity.Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }
}
