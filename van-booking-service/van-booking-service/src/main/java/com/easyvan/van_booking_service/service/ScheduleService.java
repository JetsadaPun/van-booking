package com.easyvan.van_booking_service.service;

import com.easyvan.van_booking_service.entity.Route;
import com.easyvan.van_booking_service.entity.Schedule;
import com.easyvan.van_booking_service.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    private final RouteRepository routeRepository;
    private final com.easyvan.van_booking_service.repository.SchedulesRepository schedulesRepository;

    public ScheduleService(RouteRepository routeRepository,
            com.easyvan.van_booking_service.repository.SchedulesRepository schedulesRepository) {
        this.routeRepository = routeRepository;
        this.schedulesRepository = schedulesRepository;
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

        LocalTime startTime;
        LocalTime endTime;

        switch (date.getDayOfWeek()) {
            case SATURDAY:
            case SUNDAY:
                startTime = LocalTime.of(10, 0);
                endTime = LocalTime.of(17, 0);
                break;
            default:
                startTime = LocalTime.of(8, 0);
                endTime = LocalTime.of(18, 0);
                break;
        }

        LocalTime currentTime = startTime;
        long virtualId = 1;
        while (!currentTime.isAfter(endTime)) {
            Schedule sch = new Schedule();
            sch.setId(virtualId++);
            sch.setRoute(route);
            sch.setDepartureTime(LocalDateTime.of(date, currentTime));
            sch.setStatus("AVAILABLE");
            generatedSchedules.add(sch);

            currentTime = currentTime.plusMinutes(30);
        }

        return generatedSchedules;
    }
}
