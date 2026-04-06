package com.easyvan.van_booking_service.controller;

import com.easyvan.van_booking_service.entity.DriverReport;
import com.easyvan.van_booking_service.repository.DriverReportRepository;
import com.easyvan.van_booking_service.repository.BookingRepository;
import com.easyvan.van_booking_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class DriverReportController {

    @Autowired
    private DriverReportRepository reportRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<String> submitReport(@RequestBody Map<String, Object> payload) {
        try {
            Long bookingId = Long.valueOf(payload.get("bookingId").toString());
            Long reporterId = Long.valueOf(payload.get("reporterId").toString());
            String reason = payload.get("reason").toString();
            Integer rating = Integer.valueOf(payload.get("rating").toString());

            var booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการจอง"));

            var reporter = userRepository.findById(reporterId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลผู้แจ้ง"));

            DriverReport report = new DriverReport();
            report.setBooking(booking);
            report.setReporter(reporter);
            report.setDriver(booking.getSchedule().getDriver());
            report.setReason(reason);
            report.setRating(rating);

            reportRepository.save(report);
            return ResponseEntity.ok("ส่งรายงานเรียบร้อยแล้ว ขอบคุณสำหรับข้อมูล");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("เกิดข้อผิดพลาด: " + e.getMessage());
        }
    }

    // สำหรับ Admin
    @GetMapping
    public ResponseEntity<List<DriverReport>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateReportStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        DriverReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลรายงาน"));
        
        String newStatus = payload.get("status");
        report.setStatus(DriverReport.ReportStatus.valueOf(newStatus));
        reportRepository.save(report);
        
        return ResponseEntity.ok("อัปเดตสถานะการตรวจสอบเรียบร้อยแล้ว");
    }
}
