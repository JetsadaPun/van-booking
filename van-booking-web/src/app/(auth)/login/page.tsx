
'use client'

import React from 'react'
import Link from 'next/link'
import { Bus, Mail, Lock, ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { Card, Button } from '../../components/UI'
import { Input } from '../../components/Form'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import Swal from 'sweetalert2'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login({ email, password })

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

      Toast.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ'
      })

      router.push('/')
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'ตกลง'
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-slate-500 font-medium">ยินดีต้อนรับกลับมา! กรุณากรอกข้อมูลเพื่อเข้าใช้งาน</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 p-8">

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="อีเมล"
              type="email"
              placeholder="example@mail.com"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-1">
              <Input
                label="รหัสผ่าน"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <Link href="/forgot-password" virtual-link="true" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-blue-200/50" loading={loading}>
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 font-medium">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                สมัครสมาชิกใหม่
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