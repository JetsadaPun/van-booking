
'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { Bus, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card, Button } from '../../components/UI'
import { Input } from '../../components/Form'
import { useSearchParams, useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [loading, setLoading] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false)
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'กรุณาตรวจสอบรหัสผ่านใหม่อีกครั้ง',
                confirmButtonColor: '#3085d6'
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
            }

            setSubmitted(true)

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว',
                timer: 2000,
                showConfirmButton: false
            })

            setTimeout(() => {
                router.push('/login')
            }, 2000)

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

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <p className="text-red-500 font-bold">ไม่พบ Token สำหรับการรีเซ็ตรหัสผ่าน</p>
                <Link href="/login">
                    <Button variant="outline">กลับไปหน้าล็อกอิน</Button>
                </Link>
            </div>
        )
    }

    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 p-8">
            {!submitted ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="รหัสผ่านใหม่"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        label="ยืนยันรหัสผ่านใหม่"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" className="w-full h-12 text-base" loading={loading}>
                        เปลี่ยนรหัสผ่าน
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
                        <h3 className="text-xl font-bold text-slate-900">เปลี่ยนรหัสผ่านสำเร็จ</h3>
                        <p className="text-slate-500 text-sm font-medium">
                            คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที ระบบจะพากลับไปหน้าเข้าสู่ระบบในครู่เดียว...
                        </p>
                    </div>
                </div>
            )}
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200 mb-4">
                        <Bus size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">ตั้งรหัสผ่านใหม่</h1>
                    <p className="text-slate-500 font-medium">กรุณากำหนดรหัสผ่านใหม่ที่ปลอดภัย</p>
                </div>

                <Suspense fallback={<div>กำลังโหลด...</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <Link href="/login" className="flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    <ArrowLeft size={18} /> กลับหน้าเข้าสู่ระบบ
                </Link>
            </div>
        </div>
    )
}
