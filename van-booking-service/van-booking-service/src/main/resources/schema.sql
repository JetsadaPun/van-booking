-- 1. ตารางผู้ใช้งาน (Users)
-- รองรับการเก็บ BCrypt Hashed Password (ความยาว 255 เพื่อความปลอดภัย)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('PASSENGER', 'DRIVER', 'ADMIN')),
    phone_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางรถตู้ (Vehicles)
-- สำหรับคนขับลงทะเบียนรถ และแอดมินจัดการคลังรถ
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(50),
    capacity INTEGER DEFAULT 13,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 4. ตารางรอบรถ (Schedules)
-- ฟีเจอร์ดูตารางเดินรถและให้คนขับเลือกสายการเดินทาง
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id),
    driver_id INTEGER REFERENCES users(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    departure_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE'
);

-- 5. ตารางจองตั๋ว (Bookings)
-- ฟีเจอร์จอง คืน เลื่อนตั๋ว และเลือกที่นั่ง
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
    
    -- ข้อมูลการจอง
    seat_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, COMPLETED
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- จุดรับ (Pickup) สำหรับปักหมุด Google Maps
    pickup_point TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    
    -- จุดส่ง (Drop-off) เพิ่มเข้ามาเพื่อให้ครบ Loop การเดินทาง
    dropoff_point TEXT,
    dropoff_lat DECIMAL(10, 8),
    dropoff_lng DECIMAL(11, 8),
    
    -- ข้อมูลเพิ่มเติม
    contact_phone VARCHAR(15),
    remark TEXT, -- หมายเหตุ เช่น "รอหน้าเซเว่น"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ตารางบันทึกการทำงาน (System Logs)
-- สำหรับแอดมินดู Logs การดำเนินการ
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ตารางแจ้งปัญหาและเบิกเงิน (Requests)
-- สำหรับฟีเจอร์แจ้งปัญหาและเบิกเงินของคนขับ
CREATE TABLE driver_requests (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES users(id),
    request_type VARCHAR(20), -- 'PAYOUT', 'ISSUE'
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    province VARCHAR(100) NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    is_main_hub BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    origin_station_id INTEGER REFERENCES stations(id) ON DELETE CASCADE,
    destination_station_id INTEGER REFERENCES stations(id) ON DELETE CASCADE,
    base_price DECIMAL(10, 2) NOT NULL,
    estimated_duration INTEGER, -- เวลาเดินทางนาที
    is_active BOOLEAN DEFAULT true
);

-- ล้างข้อมูลเก่าเพื่อเริ่มต้นใหม่
TRUNCATE TABLE schedules, bookings, routes, stations RESTART IDENTITY CASCADE;

-- 2. เพิ่มสถานี (Stations)
INSERT INTO stations (province, station_name, is_main_hub) VALUES
('นครปฐม', 'มก. กำแพงแสน', true),
('กรุงเทพฯ', 'มก. บางเขน', true),
('นครปฐม', 'องค์พระปฐมเจดีย์', true),
('กรุงเทพฯ', 'อนุสาวรีย์ชัยสมรภูมิ', true),
('กรุงเทพฯ', 'สถานีขนส่งหมอชิต 2', true);

-- 3. เพิ่มเส้นทาง (Routes)
INSERT INTO routes (origin_station_id, destination_station_id, base_price, estimated_duration) VALUES
(1, 2, 80.00, 90),   -- กำแพงแสน -> บางเขน
(1, 3, 40.00, 30),   -- กำแพงแสน -> องค์พระฯ
(1, 4, 100.00, 120), -- กำแพงแสน -> อนุสาวรีย์ฯ
(1, 5, 100.00, 110), -- กำแพงแสน -> หมอชิต
(2, 1, 80.00, 90),   -- บางเขน -> กำแพงแสน
(2, 3, 100.00, 100), -- บางเขน -> องค์พระฯ
(2, 5, 30.00, 30);   -- บางเขน -> หมอชิต

-- 4. สร้างคนขับรถ 7 คน
INSERT INTO users (username, email, password, full_name, role, phone_number)
VALUES 
('driver_kps_bk', 'somchai@mail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'สมชาย ขับดี', 'DRIVER', '0810000001'),
('driver_kps_op', 'somsak@mail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'สมศักดิ์ วิ่งไว', 'DRIVER', '0810000002'),
('driver_kps_av', 'somporn@mail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'สมพร สอนขับ', 'DRIVER', '0810000003'),
('driver_kps_mc', 'somkiat@mail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'สมเกียรติ ปลอดภัย', 'DRIVER', '0810000004'),
('driver_bk_kps', 'manit@mail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'มานิต มิตรดี', 'DRIVER', '0810000005'),
('driver_bk_op', 'wichai@mail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'วิชัย สายชล', 'DRIVER', '0810000006'),
('driver_bk_mc', 'anuchit@mail.com', '$2a$12$R9h/lSAbvI125scCHMLuzunZzERut8fh.w6p8pGA1f3.pW4nS.ueq', 'อนุชิต ทิศทาง', 'DRIVER', '0810000007')
ON CONFLICT (username) DO NOTHING;

-- 5. สร้างรถตู้ 7 คัน
INSERT INTO vehicles (plate_number, model, capacity, owner_id)
SELECT 
    '10-' || (1000 + i) || ' กทม', 
    'Toyota Commuter', 
    13, 
    u.id
FROM (SELECT row_number() OVER () as i, id FROM users WHERE role = 'DRIVER' ORDER BY id) u
ON CONFLICT (plate_number) DO NOTHING;

-- 6. สร้างรอบรถทุกๆ 1 ชม. (08:00 - 18:00)
INSERT INTO schedules (route_id, driver_id, vehicle_id, departure_time, status)
SELECT 
    r.id, u.id, v.id,
    CURRENT_DATE + (h.hour || ' hours')::interval,
    'AVAILABLE'
FROM routes r
JOIN (SELECT id, row_number() OVER (ORDER BY id) as rn FROM users WHERE role = 'DRIVER') u ON (u.rn = r.id)
JOIN vehicles v ON (v.owner_id = u.id)
CROSS JOIN generate_series(8, 18) as h(hour);


-- ดูรายการเที่ยวรถ
SELECT 
    r.id AS route_no,
    s_orig.station_name AS origin,
    s_dest.station_name AS destination,
    r.base_price AS price,
    r.estimated_duration AS duration
FROM routes r
JOIN stations s_orig ON r.origin_station_id = s_orig.id
JOIN stations s_dest ON r.destination_station_id = s_dest.id
ORDER BY r.id;