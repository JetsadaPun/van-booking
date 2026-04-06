package com.easyvan.van_booking_service.service;

import com.easyvan.van_booking_service.entity.Booking;
import com.easyvan.van_booking_service.repository.BookingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class BookingCleanupService {

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * รันทุกๆ 5 นาที เพื่อตรวจสอบหาการจองที่สถานะ PENDING 
     * และสร้างมานานกว่า 1 ชั่วโมง (60 นาที) แล้วทำการยกเลิกอัตโนมัติ
     */
    @Scheduled(fixedRate = 300000) // 5 minutes in milliseconds
    public void cleanupUnpaidBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
        
        List<Booking> unpaidBookings = bookingRepository.findByStatusAndCreatedAtBefore("PENDING", cutoff);
        
        if (!unpaidBookings.isEmpty()) {
            log.info("Found {} unpaid bookings to cancel that are older than 1 hour", unpaidBookings.size());
            
            for (Booking booking : unpaidBookings) {
                booking.setStatus("CANCELLED");
                // อาจจะเพิ่มเหตุผลในการยกเลิกที่นี่
                if (booking.getRemark() == null) {
                    booking.setRemark("ระบบยกเลิกอัตโนมัติเนื่องจากไม่ชำระเงินภายใน 1 ชั่วโมง");
                } else {
                    booking.setRemark(booking.getRemark() + " (ระบบยกเลิกอัตโนมัติ: ไม่ชำระเงินภายใน 1 ชม.)");
                }
            }
            
            bookingRepository.saveAll(unpaidBookings);
            log.info("Successfully cancelled {} unpaid bookings", unpaidBookings.size());
        }
    }
}
