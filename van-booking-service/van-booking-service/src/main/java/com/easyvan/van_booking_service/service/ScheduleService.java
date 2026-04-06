package com.easyvan.van_booking_service.service;

import com.easyvan.van_booking_service.entity.Route;
import com.easyvan.van_booking_service.entity.Schedule;
import com.easyvan.van_booking_service.entity.RoutineSchedule;
import com.easyvan.van_booking_service.repository.RouteRepository;
import com.easyvan.van_booking_service.repository.RoutineScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {

    private final RouteRepository routeRepository;
    private final com.easyvan.van_booking_service.repository.SchedulesRepository schedulesRepository;
    private final RoutineScheduleRepository routineScheduleRepository;

    public ScheduleService(RouteRepository routeRepository,
            com.easyvan.van_booking_service.repository.SchedulesRepository schedulesRepository,
            RoutineScheduleRepository routineScheduleRepository) {
        this.routeRepository = routeRepository;
        this.schedulesRepository = schedulesRepository;
        this.routineScheduleRepository = routineScheduleRepository;
    }

    public Schedule getScheduleById(Long id) {
        return schedulesRepository.findById(id).orElse(null);
    }

    public List<Schedule> generateDynamicSchedules(Long routeId, LocalDate date) {
        List<Schedule> generatedSchedules = new ArrayList<>();
        Route route = routeRepository.findById(routeId).orElse(null);

        if (route == null) {
            return generatedSchedules;
        }

        // Fetch routines for this route - Only show what is explicitly in the master schedule
        List<RoutineSchedule> routines = routineScheduleRepository.findByRouteId(routeId);

        // Generate actual schedules from master routine entries
        for (RoutineSchedule routine : routines) {
            if ("ACTIVE".equals(routine.getStatus())) {
                Schedule sch = new Schedule();
                // Assign a unique ID for frontend mapping
                sch.setId(routine.getId()); 
                sch.setRoute(route);
                sch.setDriver(routine.getDriver());
                sch.setVehicle(routine.getVehicle());
                sch.setDepartureTime(LocalDateTime.of(date, routine.getDepartureTime()));
                sch.setStatus("AVAILABLE");
                generatedSchedules.add(sch);
            }
        }

        // Sort by time
        generatedSchedules.sort((a, b) -> a.getDepartureTime().compareTo(b.getDepartureTime()));

        return generatedSchedules;
    }
}
