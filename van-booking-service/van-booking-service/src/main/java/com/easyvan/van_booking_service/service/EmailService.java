package com.easyvan.van_booking_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom(fromEmail);
        mailSender.send(message);
    }

    public void sendResetPasswordEmail(String to, String token) {
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String body = "สวัสดีครับ,\n\n"
                + "ได้รับคำขอในการรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ\n"
                + "กรุณาคลิกที่ลิงก์ด้านล่างเพื่อเปลี่ยนรหัสผ่าน:\n"
                + resetLink + "\n\n"
                + "หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลฉบับนี้\n"
                + "ลิงก์นี้จะมีอายุการใช้งาน 30 นาทีครับ";

        sendEmail(to, "รีเซ็ตรหัสผ่าน - EasyVan Booking", body);
    }
}
