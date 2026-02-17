package com.easyvan.van_booking_service.service;

import com.easyvan.van_booking_service.entity.Booking;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.easyvan.van_booking_service.repository.BookingRepository;
import com.easyvan.van_booking_service.repository.SchedulesRepository;

import java.util.List;

@Service
public class DriverService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SchedulesRepository schedulesRepository;

    public void verifyPickup(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการจอง"));
        booking.setStatus("PICKED_UP");
        bookingRepository.save(booking);
    }

    public List<com.easyvan.van_booking_service.dto.DriverScheduleDTO> getDriverSchedules(Long driverId) {
        List<com.easyvan.van_booking_service.entity.Schedule> schedules = schedulesRepository.findByDriverId(driverId);
        return schedules.stream().map(s -> {
            long count = bookingRepository.countByScheduleId(s.getId());
            return new com.easyvan.van_booking_service.dto.DriverScheduleDTO(s, count);
        }).toList();
    }

    public List<Booking> getBookingsBySchedule(Long scheduleId) {
        return bookingRepository.findByScheduleId(scheduleId);
    }
}
