-- 1. ตรวจสอบหรือเพิ่มคนขับรถ (ถ้ายังไม่มี)
-- หากมีแล้วระบบจะข้ามไป แต่จะอัปเดต Role ให้เป็น DRIVER แน่นอน
INSERT INTO users (username, email, password, full_name, role, phone_number)
VALUES ('driver01', 'driver01@gmail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'สมชาย ขับดี', 'DRIVER', '0812345678')
ON CONFLICT (username) DO UPDATE SET role = 'DRIVER';

-- 2. เพิ่มรถตู้ให้คนขับ
INSERT INTO vehicles (plate_number, model, capacity, owner_id)
VALUES ('ฮพ-9999', 'Toyota Commuter (Silver)', 13, (SELECT id FROM users WHERE username = 'driver01'))
ON CONFLICT (plate_number) DO NOTHING;

-- 3. สร้างรอบรถให้คนขับ 'driver01' ในวันพรุ่งนี้ (3 รอบ)
-- รอบที่ 1: มก.กำแพงแสน (ID 1) -> มก.บางเขน (ID 16) [Route ID 1]
INSERT INTO schedules (route_id, driver_id, vehicle_id, departure_time, status)
VALUES (
    1, 
    (SELECT id FROM users WHERE username = 'driver01'), 
    (SELECT id FROM vehicles WHERE plate_number = 'ฮพ-9999'), 
    CURRENT_DATE + INTERVAL '1 day' + TIME '07:00:00', 
    'AVAILABLE'
);

-- รอบที่ 2: มก.บางเขน (ID 16) -> มก.กำแพงแสน (ID 1) [Route ID 2]
INSERT INTO schedules (route_id, driver_id, vehicle_id, departure_time, status)
VALUES (
    2, 
    (SELECT id FROM users WHERE username = 'driver01'), 
    (SELECT id FROM vehicles WHERE plate_number = 'ฮพ-9999'), 
    CURRENT_DATE + INTERVAL '1 day' + TIME '12:00:00', 
    'AVAILABLE'
);

-- รอบที่ 3: มก.กำแพงแสน (ID 1) -> มก.บางเขน (ID 16) [Route ID 1]
INSERT INTO schedules (route_id, driver_id, vehicle_id, departure_time, status)
VALUES (
    1, 
    (SELECT id FROM users WHERE username = 'driver01'), 
    (SELECT id FROM vehicles WHERE plate_number = 'ฮพ-9999'), 
    CURRENT_DATE + INTERVAL '1 day' + TIME '16:00:00', 
    'AVAILABLE'
);

-- ตรวจสอบข้อมูลที่เพิ่มไป
SELECT 
    s.id AS schedule_id,
    u.full_name AS driver_name,
    v.plate_number,
    s_orig.station_name AS from_station,
    s_dest.station_name AS to_station,
    s.departure_time
FROM schedules s
JOIN users u ON s.driver_id = u.id
JOIN vehicles v ON s.vehicle_id = v.id
JOIN routes r ON s.route_id = r.id
JOIN stations s_orig ON r.origin_station_id = s_orig.id
JOIN stations s_dest ON r.destination_station_id = s_dest.id
WHERE u.username = 'driver01'
ORDER BY s.departure_time;
