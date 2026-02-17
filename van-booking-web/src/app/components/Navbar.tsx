
'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Bus, LogOut, Ticket, Clock, User, Users, ShieldCheck, Home, Navigation } from 'lucide-react'

export default function Navbar() {
    const { user, logout, isLoading } = useAuth()

    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group z-50">
                        <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                            <Bus size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            Van<span className="text-blue-600">Booking</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {user && (
                            <>
                                {user.role === 'DRIVER' ? (
                                    <Link href="/driver/dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                                        <Bus size={18} />
                                        แผงควบคุมคนขับ
                                    </Link>
                                ) : user.role === 'ADMIN' ? (
                                    <>
                                        <Link href="/admin/drivers" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <Users size={18} />
                                            จัดการคนขับ
                                        </Link>
                                        <Link href="/admin/stations" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <Home size={18} />
                                            จัดการสถานี
                                        </Link>
                                        <Link href="/admin/routes" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <Navigation size={18} />
                                            จัดการเส้นทาง
                                        </Link>
                                        <Link href="/admin/schedules" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <Clock size={18} />
                                            การมอบหมายงาน
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/booking" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <Ticket size={18} />
                                            จองที่นั่ง
                                        </Link>
                                        <Link href="/my-bookings" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <Clock size={18} />
                                            รายการจองของฉัน
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        {isLoading ? (
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                        ) : user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                                <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                                        {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 leading-tight">{user.fullName || user.username}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{user.role}</span>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden z-50 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        )}
                    </button>

                    {/* Mobile Menu Overlay */}
                    {isOpen && (
                        <div className="fixed inset-0 bg-white z-40 pt-20 px-6 md:hidden h-screen overflow-y-auto animate-in slide-in-from-top-10 duration-200">
                            <div className="flex flex-col gap-6 pb-20">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                                                {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-slate-900">{user.fullName || user.username}</div>
                                                <div className="text-sm text-slate-500 font-medium uppercase">{user.role}</div>
                                            </div>
                                        </div>
                                        {user.role === 'DRIVER' ? (
                                            <Link href="/driver/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-slate-600 font-bold text-lg p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                    <Bus size={20} />
                                                </div>
                                                แผงควบคุมคนขับ
                                            </Link>
                                        ) : user.role === 'ADMIN' ? (
                                            <>
                                                <Link href="/admin/drivers" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-slate-600 font-bold text-lg p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                        <Users size={20} />
                                                    </div>
                                                    จัดการคนขับรถ
                                                </Link>
                                                <Link href="/admin/schedules" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-slate-600 font-bold text-lg p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                                        <Clock size={20} />
                                                    </div>
                                                    จัดการตารางเวลา
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/booking" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-slate-600 font-bold text-lg p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                        <Ticket size={20} />
                                                    </div>
                                                    จองที่นั่ง
                                                </Link>
                                                <Link href="/my-bookings" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-slate-600 font-bold text-lg p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                                        <Clock size={20} />
                                                    </div>
                                                    รายการจองของฉัน
                                                </Link>
                                            </>
                                        )}
                                        <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 text-slate-600 font-bold text-lg p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                                                <User size={20} />
                                            </div>
                                            โปรไฟล์ผู้ใช้
                                        </Link>
                                        <button onClick={() => { logout(); setIsOpen(false) }} className="flex items-center gap-4 text-red-600 font-bold text-lg p-2 hover:bg-red-50 rounded-xl transition-colors mt-4">
                                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                                <LogOut size={20} />
                                            </div>
                                            ออกจากระบบ
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4 mt-4">
                                        <Link href="/login" onClick={() => setIsOpen(false)} className="w-full bg-slate-900 text-white font-bold text-center py-4 rounded-2xl shadow-lg shadow-slate-200 active:scale-95 transition-all">
                                            เข้าสู่ระบบ
                                        </Link>
                                        <Link href="/register" onClick={() => setIsOpen(false)} className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold text-center py-4 rounded-2xl active:scale-95 transition-all">
                                            สมัครสมาชิก
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
