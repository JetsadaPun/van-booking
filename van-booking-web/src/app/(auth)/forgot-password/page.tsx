
'use client'

import React from 'react'
import Link from 'next/link'
import { Bus, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card, Button } from '../../components/UI'
import { Input } from '../../components/Form'
import Swal from 'sweetalert2'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false)
    const [email, setEmail] = React.useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || 'เกิดข้อผิดพลาดในการส่งอีเมล')
            }

            setSubmitted(true)
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message,
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">ลืมรหัสผ่าน?</h1>
                    <p className="text-slate-500 font-medium">ไม่ต้องกังวล เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ</p>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50 p-8">
                    {!submitted ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label="อีเมลที่ใช้สมัครสมาชิก"
                                type="email"
                                placeholder="example@mail.com"
                                icon={<Mail size={18} />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Button type="submit" className="w-full h-12 text-base" loading={loading}>
                                ส่งลิงก์รีเซ็ตรหัสผ่าน
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-fade-in">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">ตรวจสอบอีเมลของคุณ</h3>
                                <p className="text-slate-500 text-sm font-medium">
                                    เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบในกล่องจดหมาย
                                </p>
                            </div>
                            <Link href="/login" className="block">
                                <Button variant="outline" className="w-full">
                                    กลับหน้าเข้าสู่ระบบ
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </Card>

                <Link href="/" className="flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    <ArrowLeft size={18} /> กลับหน้าหลัก
                </Link>
            </div>
        </div>
    )
}
