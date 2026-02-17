'use client'

import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/UI'
import { User, Shield, MapPin, Phone, Mail, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

export default function ProfilePage() {
    const { user, logout, updateProfile } = useAuth()
    const router = useRouter()

    const [isEditing, setIsEditing] = React.useState(false)
    const [formData, setFormData] = React.useState({
        fullName: '',
        phoneNumber: '',
    })

    React.useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
            })
        }
    }, [user])

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>กรุณาเข้าสู่ระบบ...</p>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/auth/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                // Update local state context immediately
                updateProfile(formData)

                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    text: 'ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว',
                    timer: 1500,
                    showConfirmButton: false
                })
                setIsEditing(false)
            } else {
                const text = await res.text()
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: text
                })
            }
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
            })
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-900">โปรไฟล์ของฉัน</h1>
                        <p className="text-slate-500">จัดการข้อมูลส่วนตัวและการใช้งาน</p>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
                            >
                                บันทึก
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 rounded-xl bg-white border-2 border-slate-100 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-100 transition-colors shadow-sm"
                        >
                            แก้ไขข้อมูล
                        </button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* User Info Card */}
                    <Card className="md:col-span-2 p-8 space-y-8 border-none shadow-xl shadow-slate-200/50">
                        <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-100">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 ring-8 ring-blue-50/50">
                                <User size={48} />
                            </div>
                            <div className="text-center sm:text-left space-y-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="text-xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full"
                                        placeholder="ชื่อ-นามสกุล"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-slate-900">{user.fullName || user.username}</h2>
                                )}
                                <p className="text-slate-500 font-medium text-lg">@{user.username}</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                    <Shield size={12} />
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                <MapPin size={20} className="text-slate-400" />
                                ข้อมูลส่วนตัว
                            </h3>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex items-center gap-2">
                                        <Phone size={14} /> เบอร์โทรศัพท์
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full bg-white p-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none font-semibold text-slate-700"
                                            placeholder="0xx-xxx-xxxx"
                                        />
                                    ) : (
                                        <div className="font-bold text-slate-700 text-lg">
                                            {user.phoneNumber || '-'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Actions Card */}
                    <div className="space-y-6">
                        <Card className="p-6 border-none shadow-lg shadow-slate-200/50 h-full">
                            <h3 className="font-bold text-slate-900 mb-6 text-lg">บัญชีผู้ใช้</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold"
                                >
                                    <LogOut size={20} />
                                    ออกจากระบบ
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
