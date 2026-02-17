package com.easyvan.van_booking_service.dto;

import com.easyvan.van_booking_service.entity.Schedule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverScheduleDTO {
    private Schedule schedule;
    private long passengerCount;
}
