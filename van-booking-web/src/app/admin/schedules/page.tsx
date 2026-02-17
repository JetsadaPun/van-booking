'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button } from '../../components/UI'
import {
    Calendar,
    Plus,
    Trash2,
    Search,
    X,
    Check,
    AlertCircle,
    User,
    Bus,
    Navigation,
    Clock,
    UserCircle
} from 'lucide-react'
import AdminGuard from '../../components/AdminGuard'
import { authFetch } from '../../utils/api'
import Swal from 'sweetalert2'
import { Schedule, Route, User as UserType, Vehicle } from '../../types'

export default function AdminSchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [routes, setRoutes] = useState<Route[]>([])
    const [drivers, setDrivers] = useState<UserType[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        routeId: '',
        driverId: '',
        vehicleId: '',
        departureTime: '',
        status: 'AVAILABLE'
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [schRes, rRes, dRes, vRes] = await Promise.all([
                authFetch('http://localhost:8080/api/admin/schedules'),
                authFetch('http://localhost:8080/api/admin/routes'),
                authFetch('http://localhost:8080/api/admin/drivers'),
                authFetch('http://localhost:8080/api/admin/vehicles')
            ])

            if (schRes.ok && rRes.ok && dRes.ok && vRes.ok) {
                setSchedules(await schRes.json())
                setRoutes((await rRes.json()).filter((r: Route) => r.isActive))
                setDrivers(await dRes.json())
                setVehicles(await vRes.json())
            }
        } catch (error) {
            console.error('Failed to fetch assignment data', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการยกเลิกรอบรถ?',
            text: "ข้อมูลการจองในรอบนี้จะยังคงอยู่แต่รอบรถจะถูกลบออกจากระบบ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'ลบรอบรถ',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        })

        if (result.isConfirmed) {
            try {
                const res = await authFetch(`http://localhost:8080/api/admin/schedules/${id}`, {
                    method: 'DELETE'
                })
                if (res.ok) {
                    Swal.fire('สำเร็จ', 'ลบรอบรถเรียบร้อยแล้ว', 'success')
                    setSchedules(schedules.filter(s => s.id !== id))
                }
            } catch (error) {
                Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const route = routes.find(r => r.id === Number(formData.routeId))
            const driver = drivers.find(d => d.id === Number(formData.driverId))
            const vehicle = vehicles.find(v => v.id === Number(formData.vehicleId))

            const payload = {
                route,
                driver,
                vehicle,
                departureTime: formData.departureTime,
                status: formData.status
            }

            const res = await authFetch('http://localhost:8080/api/admin/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'มอบหมายสำเร็จ', timer: 1500 })
                setIsModalOpen(false)
                fetchData()
            } else {
                throw new Error('Failed to create schedule')
            }
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <Calendar className="text-blue-600" />
                                การมอบหมายหน้าที่ (Schedules)
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">กำหนดคนขับและรถยนต์ให้กับเส้นทางในเวลาต่างๆ</p>
                        </div>
                        <Button
                            variant="primary"
                            icon={<Plus size={18} />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            สร้างรอบรถใหม่
                        </Button>
                    </div>

                    <Card className="overflow-hidden p-0 border-none shadow-xl shadow-slate-200/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold text-sm tracking-wide">
                                        <th className="px-6 py-4">เวลาเดินทาง</th>
                                        <th className="px-6 py-4">เส้นทาง</th>
                                        <th className="px-6 py-4">คนขับรถ</th>
                                        <th className="px-6 py-4">ทะเบียนรถ</th>
                                        <th className="px-6 py-4 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    {loading && schedules.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center italic">กำลังโหลด...</td></tr>
                                    ) : schedules.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center italic text-slate-400">ไม่มีรอบรถในระบบ</td></tr>
                                    ) : (
                                        schedules.map((s) => (
                                            <tr key={s.id} className="hover:bg-slate-50 transition-colors not-italic">
                                                <td className="px-6 py-4 font-bold text-blue-600">
                                                    {new Date(s.departureTime).toLocaleString('th-TH', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {s.route.originStation.stationName} → {s.route.destinationStation.stationName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <UserCircle size={16} className="text-slate-400" />
                                                        <span className="font-bold">{s.driver.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-bold text-slate-700">{s.vehicle.plateNumber}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black italic">สร้างรอบรถใหม่</h2>
                                <button onClick={() => setIsModalOpen(false)}><X /></button>
                            </div>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-bold mb-1">เส้นทาง</label>
                                    <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.routeId} onChange={e => setFormData({ ...formData, routeId: e.target.value })} required>
                                        <option value="">เลือกเส้นทาง...</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.originStation.stationName} → {r.destinationStation.stationName}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">คนขับรถ</label>
                                        <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.driverId} onChange={e => setFormData({ ...formData, driverId: e.target.value })} required>
                                            <option value="">เลือกคนขับ...</option>
                                            {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">รถที่ใช้</label>
                                        <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} required>
                                            <option value="">เลือกรถ...</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} ({v.model})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">เวลาออกเดินทาง</label>
                                    <input type="datetime-local" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.departureTime} onChange={e => setFormData({ ...formData, departureTime: e.target.value })} required />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" type="button" className="flex-1" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                                    <Button type="submit" className="flex-1" loading={loading}>บันทึกข้อมูล</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminGuard>
    )
}
