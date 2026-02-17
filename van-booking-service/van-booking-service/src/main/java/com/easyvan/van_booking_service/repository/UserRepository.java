package com.easyvan.van_booking_service.repository;

import com.easyvan.van_booking_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ค้นหาผู้ใช้จาก Username (ใช้ในระบบ Login)
    Optional<User> findByUsername(String username);

    // ตรวจสอบว่ามี Username นี้อยู่แล้วหรือไม่ (ใช้ในระบบ Register)
    boolean existsByUsername(String username);

    // สำหรับฟังก์ชันลืมรหัสผ่าน
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByResetPasswordToken(String token);
}