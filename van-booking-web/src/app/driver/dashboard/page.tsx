'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DriverGuard from '../../components/DriverGuard'
import Link from 'next/link'
import { ShieldCheck, Clock, Users, Bus, Navigation, ArrowRight, FileText } from 'lucide-react'

export default function DriverDashboard() {
    const { user } = useAuth()
    const [schedules, setSchedules] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user?.id) {
            fetchSchedules()
        } else if (user) {
            setIsLoading(false)
        }
    }, [user])

    const fetchSchedules = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/driver/schedules/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setSchedules(data)
            } else if (res.status === 401) {
                alert('สิทธิ์การใช้งานหมดอายุ กรุณาล็อกอินใหม่')
            }
        } catch (error) {
            console.error('Failed to fetch driver schedules:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySchedules = schedules.filter(item =>
        item.schedule.departureTime.startsWith(todayStr)
    );

    return (
        <DriverGuard>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 italic">
                                <ShieldCheck className="text-blue-600" size={40} />
                                DASHBOARD
                            </h1>
                            <p className="mt-1 text-slate-500 font-bold uppercase tracking-widest text-sm">ยินดีต้อนรับคุณ {user?.fullName || 'คนขับรถ'}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">สถานะการทำงาน</p>
                                <p className="text-green-600 font-black flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    ONLINE
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl shadow-xl shadow-blue-200 text-white flex flex-col justify-between">
                            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-blue-100 font-bold uppercase tracking-widest text-xs">งานทั้งหมดวันนี้</h3>
                                <p className="text-4xl font-black">{todaySchedules.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div className="bg-green-50 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs tracking-tighter">ผู้โดยสารรวม (วันนี้)</h3>
                                <p className="text-4xl font-black text-slate-900">
                                    {todaySchedules.reduce((acc, item) => acc + (item.passengerCount || 0), 0)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                            <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                                <Bus size={24} />
                            </div>
                            <div>
                                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs tracking-tighter">สถานะรถยนต์</h3>
                                <p className="text-2xl font-black text-slate-900 uppercase">ปกติ</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 italic">MY SCHEDULES</h2>
                            <div className="h-px flex-1 bg-slate-200 mx-6"></div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : schedules.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {schedules
                                    .sort((a, b) => new Date(a.schedule.departureTime).getTime() - new Date(b.schedule.departureTime).getTime())
                                    .map((item: any) => {
                                        const departureDate = new Date(item.schedule.departureTime);
                                        const isPassed = departureDate.getTime() < new Date().getTime();

                                        return (
                                            <div key={item.schedule.id} className={`group relative rounded-[2rem] shadow-sm border transition-all duration-500 hover:-translate-y-2 overflow-hidden ${isPassed
                                                ? 'bg-red-50/50 border-red-100'
                                                : 'bg-white border-slate-100 hover:shadow-2xl hover:shadow-blue-100'
                                                }`}>
                                                <div className="p-8">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border ${isPassed
                                                            ? 'bg-red-100 text-red-700 border-red-200'
                                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                                            }`}>
                                                            TRIP #{item.schedule.id}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${isPassed ? 'bg-red-500' : 'bg-green-500'
                                                                }`}></div>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isPassed ? 'text-red-600' : 'text-slate-400'
                                                                }`}>
                                                                {isPassed ? 'CLOSED' : item.schedule.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isPassed
                                                                ? 'bg-red-100 text-red-400 group-hover:bg-red-600 group-hover:text-white'
                                                                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                                                                }`}>
                                                                <Clock size={20} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPassed ? 'text-red-300' : 'text-slate-400'}`}>DEPARTURE</p>
                                                                <p className={`text-lg font-black leading-tight ${isPassed ? 'text-red-900' : 'text-slate-900'}`}>
                                                                    {new Date(item.schedule.departureTime).toLocaleTimeString('th-TH', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })} น.
                                                                </p>
                                                                <p className={`text-xs font-bold ${isPassed ? 'text-red-400' : 'text-slate-400'}`}>
                                                                    {new Date(item.schedule.departureTime).toLocaleDateString('th-TH', {
                                                                        day: 'numeric',
                                                                        month: 'short'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isPassed
                                                                ? 'bg-red-100 text-red-400 group-hover:bg-red-600 group-hover:text-white'
                                                                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                                                                }`}>
                                                                <Navigation size={20} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPassed ? 'text-red-300' : 'text-slate-400'}`}>ROUTE</p>
                                                                <div className="space-y-1">
                                                                    <p className={`text-sm font-black flex items-center gap-2 ${isPassed ? 'text-red-900' : 'text-slate-900'}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-red-600' : 'bg-blue-600'}`}></span>
                                                                        {item.schedule.route.originStation.stationName}
                                                                    </p>
                                                                    <div className={`w-px h-3 ml-0.5 ${isPassed ? 'bg-red-200' : 'bg-slate-200'}`}></div>
                                                                    <p className={`text-sm font-black flex items-center gap-2 ${isPassed ? 'text-red-900' : 'text-slate-900'}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-red-300' : 'bg-slate-300'}`}></span>
                                                                        {item.schedule.route.destinationStation.stationName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={`pt-4 flex items-center justify-between border-t ${isPassed ? 'border-red-100' : 'border-slate-50'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`${isPassed ? 'bg-red-100' : 'bg-green-50'} px-4 py-2 rounded-2xl`}>
                                                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isPassed ? 'text-red-600' : 'text-green-600'}`}>PASSENGERS</p>
                                                                    <p className={`text-xl font-black leading-none ${isPassed ? 'text-red-700' : 'text-green-700'}`}>{item.passengerCount || 0}</p>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                href={`/driver/schedule/${item.schedule.id}`}
                                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-300 shadow-xl ${isPassed
                                                                    ? 'bg-red-900 hover:bg-red-600 shadow-red-200'
                                                                    : 'bg-slate-900 hover:bg-blue-600 shadow-slate-200'
                                                                    } hover:scale-110 active:scale-90`}
                                                            >
                                                                <ArrowRight size={20} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl shadow-slate-200/50 border border-slate-50">
                                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
                                    <FileText size={48} className="text-slate-200" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 italic">NO ASSIGNMENTS</h2>
                                <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed uppercase text-xs tracking-[0.2em]">ขณะนี้คุณยังไม่มีรอบเดินรถในระบบ<br />กรุณารอการมอบหมายงานจากฝ่ายจัดการ</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DriverGuard>
    )
}
