# 🚐 Van Booking System

ระบบจองตั๋วรถตู้ออนไลน์ที่พัฒนาด้วยเทคโนโลยีสมัยใหม่ เพื่ออำนวยความสะดวกในการค้นหาเส้นทาง เลือกที่นั่ง และจัดการการจองตั๋วได้อย่างง่ายดายและรวดเร็ว

## 🌟 ฟีเจอร์หลัก (Key Features)

### 👤 สำหรับผู้ใช้งาน (Passenger)
- **ระบบสมาชิก:** สมัครสมาชิก, เข้าสู่ระบบ (JWT Authentication), แก้ไขข้อมูลส่วนตัว
- **ค้นหาเที่ยวรถ:** ค้นหาเส้นทางรถตู้ตามจุดเริ่มต้นและปลายทาง
- **จองตั๋ว:** เลือกที่นั่งแบบระบุตำแหน่งได้
- **จัดการการจอง:** ดูรายการจองของฉัน, ยกเลิกการจอง, เลื่อนวันเดินทาง (Reschedule)
- **ระบบล็อคที่นั่ง:** ป้องกันการจองที่นั่งซ้ำซ้อนแบบ Real-time (ใช้ Redis Lock)

### 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

#### Frontend (van-booking-web)
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Maps:** [React Leaflet](https://react-leaflet.js.org/)
- **Notifications:** [SweetAlert2](https://sweetalert2.github.io/)

#### Backend (van-booking-service)
- **Framework:** [Spring Boot](https://spring.io/projects/spring-boot) (Java)
- **Security:** Spring Security & JWT
- **Database:** PostgreSQL
- **Caching & Locking:** Redis (สำหรับการจัดการ Concurrency ในการจองที่นั่ง)
- **Build Tool:** Maven

## 🚀 การติดตั้งและใช้งาน (Installation)

### 1. Backend Setup
เข้าไปที่โฟลเดอร์ `van-booking-service`
1. ตรวจสอบว่ามี Java JDK 17+ และ Maven ติดตั้งอยู่
2. ตรวจสอบไฟล์ `application.properties` ให้เชื่อมต่อ Database และ Redis ได้ถูกต้อง
3. รันคำสั่ง:
   ```bash
   mvn spring-boot:run
   ```
   Server จะเริ่มทำงานที่ `http://localhost:8081`

### 2. Frontend Setup
เข้าไปที่โฟลเดอร์ `van-booking-web`
1. ตรวจสอบว่ามี Node.js ติดตั้งอยู่
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. รัน Development Server:
   ```bash
   npm run dev
   ```
   เว็บแอปพลิเคชันจะทำงานที่ `http://localhost:3001`

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

- `van-booking-web/`: Source code ส่วนหน้าเว็บ (Frontend)
- `van-booking-service/`: Source code ส่วนเซิร์ฟเวอร์ (Backend)

## 🔑 ตัวอย่างบัญชีผู้ใช้ (Demo Credentials)
*(หากมีการสร้างข้อมูลตั้งต้น)*
- **User:** `user` / `password`
- **Admin:** `admin` / `admin`

---
พัฒนาโดย [ชื่อของคุณ / ทีมของคุณ]
