'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import DriverGuard from '../../../components/DriverGuard'
import { Booking } from '../../../types'
import { MapPin, Clock, Users, Phone, CheckCircle, ChevronLeft, Search, User, Bus, AlertCircle } from 'lucide-react'

export default function ScheduleDetail() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [scheduleInfo, setScheduleInfo] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (id) {
            fetchScheduleData()
        }
    }, [id])

    const fetchScheduleData = async () => {
        try {
            const schRes = await fetch(`http://localhost:8080/api/schedules/${id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            if (schRes.ok) {
                setScheduleInfo(await schRes.json())
            }

            const res = await fetch(`http://localhost:8080/api/driver/schedules/${id}/bookings`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            if (res.ok) {
                setBookings(await res.json())
            }
        } catch (error) {
            console.error('Failed to fetch schedule data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyPickup = async (bookingId: number) => {
        try {
            const res = await fetch(`http://localhost:8080/api/driver/verify-pickup/${bookingId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            if (res.ok) {
                setBookings(prev => prev.map(b =>
                    b.id === bookingId ? { ...b, status: 'PICKED_UP' } : b
                ))
            }
        } catch (error) {
            console.error('Verify pickup failed:', error)
        }
    }

    const filteredBookings = bookings.filter(b =>
    (b.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.contactPhone?.includes(searchQuery) ||
        b.seatNumber.toString().includes(searchQuery))
    ).sort((a, b) => a.seatNumber - b.seatNumber)

    return (
        <DriverGuard>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.back()}
                                className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-90"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                    รายชื่อผู้โดยสาร
                                    <span className="text-blue-600 font-black italic">TRIP #{id}</span>
                                </h1>
                                {scheduleInfo && (
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
                                        {scheduleInfo.route.originStation.stationName} → {scheduleInfo.route.destinationStation.stationName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {scheduleInfo && (
                            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 italic font-black">
                                <Clock className="text-blue-600" size={18} />
                                {new Date(scheduleInfo.departureTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                            </div>
                        )}
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">จองแล้ว</p>
                                <p className="text-2xl font-black">{bookings.length} ที่นั่ง</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ขึ้นรถแล้ว</p>
                                <p className="text-2xl font-black">{bookings.filter(b => b.status === 'PICKED_UP').length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">รอดำเนินการ</p>
                                <p className="text-2xl font-black text-amber-600">{bookings.filter(b => b.status !== 'PICKED_UP').length}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 text-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Bus size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ความจุ</p>
                                <p className="text-2xl font-black">13 ที่นั่ง</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-black text-slate-900 italic uppercase">Passenger List</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
                                    className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold transition-all w-full md:w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">กำลังโหลดข้อมูลผู้โดยสาร...</p>
                            </div>
                        ) : filteredBookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seat</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pickup</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                                                        {booking.seatNumber}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                                            {booking.user?.fullName?.[0] || <User size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-900 leading-none mb-1">{booking.user?.fullName || 'Anonymous'}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: #{booking.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                        <Phone size={14} className="text-slate-300" />
                                                        {booking.contactPhone || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-start gap-2 max-w-xs">
                                                        <MapPin size={14} className="text-slate-300 shrink-0 mt-0.5" />
                                                        <p className="text-xs font-bold text-slate-600 leading-snug">{booking.pickupPoint}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${booking.status === 'PICKED_UP' ? 'bg-green-500' :
                                                                booking.status === 'CONFIRMED' ? 'bg-blue-500' : 'bg-amber-500'
                                                            }`}></span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${booking.status === 'PICKED_UP' ? 'text-green-600' :
                                                                booking.status === 'CONFIRMED' ? 'text-blue-600' : 'text-amber-600'
                                                            }`}>
                                                            {booking.status === 'PICKED_UP' ? 'BOARDED' :
                                                                booking.status === 'CONFIRMED' ? 'PAID' : 'PENDING'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {booking.status !== 'PICKED_UP' ? (
                                                        <button
                                                            onClick={() => booking.id && handleVerifyPickup(booking.id)}
                                                            className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-100"
                                                        >
                                                            Check In
                                                        </button>
                                                    ) : (
                                                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                                            <CheckCircle size={20} />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Users className="text-slate-200" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 italic uppercase">No Passengers Found</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">ยังไม่มีการจองสำหรับรอบนี้</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DriverGuard>
    )
}
