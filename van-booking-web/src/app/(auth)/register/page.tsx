'use client'

import React, { useState } from 'react'
import Swal from 'sweetalert2'
import Link from 'next/link'
import { Bus, Mail, Lock, User, ArrowLeft, Phone } from 'lucide-react'
import { Card, Button } from '../../components/UI'
import { Input } from '../../components/Form'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'ข้อมูลไม่ถูกต้อง',
                text: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน',
                confirmButtonColor: '#3085d6'
            })
            return
        }

        setLoading(true)

        try {
            const res = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    role: 'PASSENGER'
                })
            })

            if (!res.ok) {
                const data = await res.text()
                throw new Error(data || 'การลงทะเบียนล้มเหลว')
            }

            // Success
            await Swal.fire({
                icon: 'success',
                title: 'ลงทะเบียนสำเร็จ',
                text: 'กรุณาเข้าสู่ระบบด้วยบัญชีใหม่ของคุณ',
                showConfirmButton: false,
                timer: 2000
            })
            router.push('/login?registered=true')
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'ลงทะเบียนไม่สำเร็จ',
                text: err.message || 'โปรดตรวจสอบข้อมูลอีกครั้ง',
                confirmButtonColor: '#3085d6'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200 mb-4 hover:scale-105 transition-transform">
                        <Bus size={32} />
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">สมัครสมาชิก</h1>
                    <p className="text-slate-500 font-medium">เริ่มต้นการเดินทางของคุณกับ VanBooking</p>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50 p-8">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Input
                            label="ชื่อ-นามสกุล"
                            name="fullName"
                            type="text"
                            placeholder="สมชาย ใจดี"
                            icon={<User size={18} />}
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="ชื่อผู้ใช้ (Username)"
                            name="username"
                            type="text"
                            placeholder="somchai"
                            icon={<User size={18} />}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="อีเมล"
                            name="email"
                            type="email"
                            placeholder="example@mail.com"
                            icon={<Mail size={18} />}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="เบอร์โทรศัพท์"
                            name="phoneNumber"
                            type="tel"
                            placeholder="08x-xxx-xxxx"
                            icon={<Phone size={18} />}
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="รหัสผ่าน"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="ยืนยันรหัสผ่าน"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        <div className="pt-2">
                            <Button type="submit" className="w-full h-12 text-base" loading={loading}>
                                สร้างบัญชีผู้ใช้
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-500 font-medium">
                            เป็นสมาชิกอยู่แล้ว?{' '}
                            <Link href="/login" className="text-blue-600 font-bold hover:underline">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </Card>

                <Link href="/" className="flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    <ArrowLeft size={18} /> กลับหน้าหลัก
                </Link>
            </div>
        </div>
    )
}
