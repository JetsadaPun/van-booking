'use client'

import React, { useEffect, useState } from 'react'
import { Card, Button } from '../../components/UI'
import { Check, Calendar, Clock, MapPin, User, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { authFetch } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import Swal from 'sweetalert2'

const BACKEND_URL = 'http://localhost:8080'

export default function MyBookingsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingBooking, setEditingBooking] = useState<any | null>(null)
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [timeFilter, setTimeFilter] = useState('ALL')

    const filteredBookings = bookings.filter(booking => {
        // Status Filter
        if (statusFilter !== 'ALL' && booking.status !== statusFilter) {
            return false
        }

        // Time Filter
        if (timeFilter !== 'ALL') {
            const bookingDate = new Date(booking.schedule.departureTime)
            const now = new Date()

            if (timeFilter === 'THIS_MONTH') {
                if (bookingDate.getMonth() !== now.getMonth() ||
                    bookingDate.getFullYear() !== now.getFullYear()) {
                    return false
                }
            }

            if (timeFilter === 'THIS_WEEK') {
                const startOfWeek = new Date(now)
                startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
                startOfWeek.setHours(0, 0, 0, 0)

                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(startOfWeek.getDate() + 6)
                endOfWeek.setHours(23, 59, 59, 999)

                if (bookingDate < startOfWeek || bookingDate > endOfWeek) {
                    return false
                }
            }
        }

        return true
    })

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            setLoading(false)
            return
        }

        const fetchMyBookings = async () => {
            try {
                const res = await authFetch(`${BACKEND_URL}/api/bookings/user/${user.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setBookings(data)
                }
            } catch (err) {
                console.error('Error fetching bookings:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMyBookings()
        fetchMyBookings()
    }, [user, authLoading])

    const handleCancel = async (bookingId: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการยกเลิก?',
            text: "คุณต้องการยกเลิกการจองนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ยกเลิกเลย',
            cancelButtonText: 'ไม่, เก็บไว้'
        })

        if (!result.isConfirmed) return

        try {
            const res = await authFetch(`${BACKEND_URL}/api/bookings/${bookingId}/cancel`, {
                method: 'PUT'
            })
            if (res.ok) {
                Swal.fire(
                    'ยกเลิกสำเร็จ!',
                    'การจองของคุณถูกยกเลิกแล้ว',
                    'success'
                )
                // Refresh
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
            } else {
                const txt = await res.text()
                Swal.fire(
                    'เกิดข้อผิดพลาด',
                    txt,
                    'error'
                )
            }
        } catch (err) {
            Swal.fire(
                'เกิดข้อผิดพลาด',
                'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                'error'
            )
        }
    }

    const startEdit = (booking: any) => {
        setEditingBooking(booking)
        const d = new Date(booking.schedule.departureTime)
        setNewDate(d.toISOString().split('T')[0]) // YYYY-MM-DD
        setNewTime(d.toTimeString().slice(0, 5)) // HH:mm
    }

    const cancelEdit = () => {
        setEditingBooking(null)
        setNewDate('')
        setNewTime('')
    }

    const saveReschedule = async () => {
        if (!editingBooking || !newDate || !newTime) return

        const dateTimeStr = `${newDate}T${newTime}:00`

        try {
            const res = await authFetch(`${BACKEND_URL}/api/bookings/${editingBooking.id}/reschedule?newDepartureTime=${dateTimeStr}`, {
                method: 'PUT'
            })

            if (res.ok) {
                Swal.fire(
                    'สำเร็จ!',
                    'เลื่อนการเดินทางเรียบร้อยแล้ว',
                    'success'
                )
                setBookings(prev => prev.map(b => {
                    if (b.id === editingBooking.id) {
                        return {
                            ...b,
                            schedule: {
                                ...b.schedule,
                                departureTime: dateTimeStr
                            }
                        }
                    }
                    return b
                }))
                cancelEdit()
            } else {
                const txt = await res.text()
                Swal.fire(
                    'เกิดข้อผิดพลาด',
                    txt,
                    'error'
                )
            }
        } catch (err) {
            Swal.fire(
                'เกิดข้อผิดพลาด',
                'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                'error'
            )
        }
    }

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-black">กรุณาเข้าสู่ระบบ</h2>
                        <p className="text-black mt-2">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถดูรายการจองได้</p>
                    </div>
                    <Link href="/login" className="block">
                        <Button className="w-full">เข้าสู่ระบบ</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                        <Link href="/">
                            <Button variant="outline" size="sm" className="rounded-full w-8 h-8 md:w-10 md:h-10 p-0">
                                <ChevronLeft size={16} className="md:w-5 md:h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl md:text-3xl font-bold text-black">รายการจองของฉัน</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Time Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 md:pl-4 md:pr-10 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-xs md:text-sm h-full"
                            >
                                <option value="ALL">ทุกช่วงเวลา</option>
                                <option value="THIS_WEEK">สัปดาห์นี้</option>
                                <option value="THIS_MONTH">เดือนนี้</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <Calendar size={14} className="md:w-4 md:h-4" />
                            </div>
                        </div>

                        {/* Status Tabs */}
                        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
                            {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`flex-1 sm:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap
                                    ${statusFilter === status
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {status === 'ALL' ? 'ทั้งหมด'
                                        : status === 'CONFIRMED' ? 'จองสำเร็จ'
                                            : status === 'PENDING' ? 'รอชำระเงิน'
                                                : 'ยกเลิกแล้ว'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">กำลังโหลดข้อมูล...</div>
                ) : filteredBookings.length === 0 ? (
                    <Card className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black">ไม่พบรายการจอง</h3>
                            <p className="text-black">
                                {statusFilter === 'ALL' && timeFilter === 'ALL'
                                    ? 'คุณยังไม่ได้ทำรายการจองใดๆ ในขณะนี้'
                                    : 'ไม่พบรายการจองตามเงื่อนไขที่เลือก (ลองเปลี่ยนตัวกรอง)'}
                            </p>
                        </div>
                        {statusFilter === 'ALL' && timeFilter === 'ALL' && (
                            <div className="mt-2">
                                <Link href="/booking">
                                    <Button>จองตั๋วรถตู้ทันที</Button>
                                </Link>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {filteredBookings.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden border-none shadow-md">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-4 py-1 rounded-full text-xs font-bold 
                                            ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700'
                                                : booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'}`}>
                                            {booking.status === 'PENDING' ? 'รอชำระเงิน'
                                                : booking.status === 'CANCELLED' ? 'ยกเลิกแล้ว'
                                                    : 'จองสำเร็จ'}
                                        </div>
                                        <div className="text-lg font-bold text-blue-600">
                                            ฿{booking.totalPrice}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {booking.status !== 'CANCELLED' && editingBooking?.id !== booking.id && (
                                        <div className="flex gap-2 mb-4 justify-end">
                                            <Button variant="outline" size="sm" onClick={() => startEdit(booking)}>
                                                เลื่อนการเดินทาง
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleCancel(booking.id)} className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100">
                                                ยกเลิก
                                            </Button>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-black">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-black">วันที่เดินทาง</p>
                                                    <p className="font-bold text-black">{new Date(booking.schedule.departureTime).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-black">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-black">เวลาเดินรถ</p>
                                                    <p className="font-bold text-black">{new Date(booking.schedule.departureTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-black">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-black">ที่นั่ง</p>
                                                    <p className="font-bold text-black">เบอร์ {booking.seatNumber}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                            <div className="relative mb-6">
                                                <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                                <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                                <p className="text-xs text-black">จุดรับ</p>
                                                <p className="font-medium text-sm text-black">{booking.pickupPoint}</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>
                                                <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>
                                                <p className="text-xs text-black">จุดส่ง</p>
                                                <p className="font-medium text-sm text-black">{booking.dropoffPoint}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {editingBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-black">เลื่อนการเดินทาง</h3>
                            <button onClick={cancelEdit} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <span className="text-xl font-medium">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">วันที่เดินทางใหม่</label>
                                <input
                                    type="date"
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-colors text-black font-medium"
                                    value={newDate}
                                    min={new Date().toLocaleDateString('en-CA')}
                                    onChange={(e) => setNewDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">เวลาเดินรถใหม่</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-colors text-black font-medium appearance-none bg-white"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                >
                                    <option value="">เลือกเวลา</option>
                                    {Array.from({ length: 21 }).map((_, i) => {
                                        const hour = 8 + Math.floor(i / 2)
                                        const min = i % 2 === 0 ? '00' : '30'
                                        const timeStr = `${hour.toString().padStart(2, '0')}:${min}`
                                        return <option key={timeStr} value={timeStr}>{timeStr} น.</option>
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 py-3" onClick={cancelEdit}>ยกเลิก</Button>
                            <Button className="flex-1 py-3" onClick={saveReschedule} disabled={!newDate || !newTime}>ยืนยันการเปลี่ยนแปลง</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
