package com.easyvan.van_booking_service.controller;

import com.easyvan.van_booking_service.entity.Schedule;
import com.easyvan.van_booking_service.service.ScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "http://localhost:3000")
public class SchedulesController {

    private final ScheduleService scheduleService;

    public SchedulesController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/{id}")
    public Schedule getScheduleById(@PathVariable Long id) {
        return scheduleService.getScheduleById(id);
    }

    @GetMapping
    public List<Schedule> getDynamicSchedules(
            @RequestParam(name = "routeId") Long routeId,
            @RequestParam(name = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return scheduleService.generateDynamicSchedules(routeId, date);
    }
}
