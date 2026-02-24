package com.easyvan.van_booking_service.controller;

import com.easyvan.van_booking_service.dto.Slip2GoResponseDTO;
import com.easyvan.van_booking_service.entity.Booking;
import com.easyvan.van_booking_service.repository.BookingRepository;
import com.easyvan.van_booking_service.service.BookingService;
import com.easyvan.van_booking_service.service.FileStorageService;
import com.easyvan.van_booking_service.service.Slip2GoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final Slip2GoService slip2GoService;
    private final FileStorageService fileStorageService;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @PostMapping("/verify-slip/{bookingId}")
    public ResponseEntity<?> verifyAndUploadSlip(
            @PathVariable Long bookingId,
            @RequestParam("file") MultipartFile file) {

        try {
            // 1. ตรวจสอบข้อมูลการจอง
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("ไม่พบข้อมูลการจอง ID: " + bookingId));

            // 2. เรียก API ตรวจสอบสลิป
            Slip2GoResponseDTO response = slip2GoService.verifySlip(file);

            if (response != null && response.isSuccess() && response.getData() != null) {
                Slip2GoResponseDTO.Data data = response.getData();

                // ตรวจสอบยอดเงิน (เผื่อลูกค้าโอนไม่ครบ)
                if (data.getAmount() < booking.getTotalPrice()) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "message", "ยอดเงินในสลิป (" + data.getAmount() + ") น้อยกว่ายอดที่ต้องชำระ ("
                                    + booking.getTotalPrice() + ")"));
                }

                // 3. บันทึกไฟล์รูปสลิป
                String fileName = fileStorageService.store(file);

                // 4. อัปเดตสถานะการจองและปลดล็อกที่นั่ง
                bookingService.confirmPayment(bookingId, fileName, data.getTransRef());

                return ResponseEntity.ok(Map.of(
                        "message", "ชำระเงินสำเร็จ!",
                        "transactionInfo", data));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "message",
                        "ไม่สามารถตรวจสอบสลิปได้: " + (response != null ? response.getMessage() : "Unknown error")));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "เกิดข้อผิดพลาด: " + e.getMessage()));
        }
    }
}
