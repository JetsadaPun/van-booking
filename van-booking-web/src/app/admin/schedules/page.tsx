'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button } from '../../components/UI'
import {
    Plus,
    Trash2,
    X,
    User,
    Bus,
    Navigation,
    Clock,
    Upload
} from 'lucide-react'
import AdminGuard from '../../components/AdminGuard'
import { authFetch } from '../../utils/api'
import Swal from 'sweetalert2'
import { Route, User as UserType, Vehicle } from '../../types'

const BACKEND_URL = 'http://localhost:8081'

export default function AdminSchedulesPage() {
    const [routes, setRoutes] = useState<Route[]>([])
    const [drivers, setDrivers] = useState<UserType[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [routines, setRoutines] = useState<any[]>([])
    
    const [loading, setLoading] = useState(true)
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false)

    const [routineFormData, setRoutineFormData] = useState({
        routeId: '',
        driverId: '',
        vehicleId: '',
        departureTime: '', // HH:mm
        status: 'ACTIVE'
    })

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [rRes, dRes, vRes, routineRes] = await Promise.all([
                authFetch(`${BACKEND_URL}/api/admin/routes`),
                authFetch(`${BACKEND_URL}/api/admin/drivers`),
                authFetch(`${BACKEND_URL}/api/admin/vehicles`),
                authFetch(`${BACKEND_URL}/api/admin/routines`)
            ])

            if (rRes.ok && dRes.ok && vRes.ok && routineRes.ok) {
                setRoutes((await rRes.json()).filter((r: Route) => r.isActive))
                setDrivers(await dRes.json())
                setVehicles(await vRes.json())
                setRoutines(await routineRes.json())
            }
        } catch (error) {
            console.error('Failed to fetch data', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const res = await authFetch(`${BACKEND_URL}/api/admin/routines/import`, {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                Swal.fire('สำเร็จ', 'นำเข้าตารางเดินรถถาวรเรียบร้อยแล้ว', 'success')
                fetchData()
            } else {
                const errData = await res.json()
                throw new Error(errData.message || 'การนำเข้าข้อมูลล้มเหลว')
            }
        } catch (error: any) {
            Swal.fire('ผิดพลาด', error.message, 'error')
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDeleteRoutine = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบตารางถาวร?',
            text: "รอบรถเวลานี้สำหรับเส้นทางนี้จะถูกลบออกจากระบบถาวร",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        })

        if (!result.isConfirmed) return

        try {
            const res = await authFetch(`${BACKEND_URL}/api/admin/routines/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                Swal.fire('สำเร็จ', 'ลบตารางประจำเรียบร้อยแล้ว', 'success')
                fetchData()
            }
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error')
        }
    }

    const handleClearAllRoutines = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการล้างตารางทั้งหมด?',
            text: "ข้อมูลรอบรถถาวรทั้งหมดจะถูกลบออก และผู้โดยสารจะไม่เห็นรอบรถใดๆ จนกว่าจะสร้างใหม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ล้างทั้งหมด',
            cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
            setLoading(true)
            try {
                const res = await authFetch(`${BACKEND_URL}/api/admin/routines/all`, {
                    method: 'DELETE'
                })
                if (res.ok) {
                    Swal.fire('สำเร็จ', 'ล้างข้อมูลตารางประจำเรียบร้อยแล้ว', 'success')
                    fetchData()
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleSubmitRoutine = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            route: { id: parseInt(routineFormData.routeId) },
            driver: routineFormData.driverId ? { id: parseInt(routineFormData.driverId) } : null,
            vehicle: routineFormData.vehicleId ? { id: parseInt(routineFormData.vehicleId) } : null,
            departureTime: routineFormData.departureTime + ":00",
            status: 'ACTIVE'
        }

        try {
            const res = await authFetch(`${BACKEND_URL}/api/admin/routines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                Swal.fire('สำเร็จ', 'บันทึกตารางประจำเรียบร้อยแล้ว', 'success')
                setIsRoutineModalOpen(false)
                fetchData()
            }
        } catch (error) {
            Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกได้', 'error')
        }
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 text-black">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
                                <Clock className="text-blue-600" />
                                Master <span className="text-blue-600">Schedules</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">จัดการตารางเดินรถถาวร (มีผลตลอดไป)</p>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv"
                                onChange={handleImportCSV}
                            />
                            <Button
                                variant="outline"
                                icon={<Upload size={18} />}
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-xl font-bold"
                            >
                                นำเข้า CSV
                            </Button>

                            <Button
                                variant="primary"
                                icon={<Plus size={18} />}
                                onClick={() => {
                                    setRoutineFormData({ routeId: '', driverId: '', vehicleId: '', departureTime: '', status: 'ACTIVE' })
                                    setIsRoutineModalOpen(true)
                                }}
                                className="rounded-xl font-bold shadow-lg shadow-blue-200"
                            >
                                เพิ่มตารางประจำ
                            </Button>
                        </div>
                    </div>

                    <Card className="overflow-hidden p-0 border-none shadow-2xl shadow-slate-200/50 rounded-[2rem]">
                        <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
                            <div>
                                <h2 className="font-black text-slate-900 flex items-center gap-2 uppercase italic text-lg">
                                    <Clock size={18} className="text-blue-600" />
                                    ตารางการเดินรถประจำ (Routine)
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">กำหนดคนขับและรถให้ "ถาวร" ในเวลาที่ระบุ</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-black">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">เวลา</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">เส้นทาง</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">คนขับ</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ทะเบียนรถ</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading && routines.length === 0 ? (
                                        <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">กำลังเชื่อมต่อฐานข้อมูล...</td></tr>
                                    ) : routines.length === 0 ? (
                                        <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold">ไม่มีตารางประจำในระบบ กรุณาเพิ่มข้อมูล</td></tr>
                                    ) : (
                                        routines.map((routine: any) => (
                                            <tr key={routine.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2 text-blue-600 font-black text-lg italic">
                                                        <Clock size={16} />
                                                        {routine.departureTime.slice(0, 5)} น.
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Route</span>
                                                        <span className="font-bold text-slate-700">{routine.route.originStation.stationName} → {routine.route.destinationStation.stationName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                            <User size={14} />
                                                        </div>
                                                        <span className="font-black text-slate-900">{routine.driver?.fullName || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                                        <Bus size={12} className="text-slate-400" />
                                                        <span className="text-xs font-black text-slate-700">{routine.vehicle?.plateNumber || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button
                                                        onClick={() => handleDeleteRoutine(routine.id)}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
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

                {/* Routine Modal */}
                {isRoutineModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
                            <div className="flex items-center justify-between text-black">
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase">Add <span className="text-blue-600">Routine</span></h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">เพิ่มรอบรถถาวรรายวัน</p>
                                </div>
                                <button onClick={() => setIsRoutineModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:rotate-90 transition-transform"><X size={20} /></button>
                            </div>
                            
                            <form className="space-y-6 text-black" onSubmit={handleSubmitRoutine}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เส้นทางหลัก</label>
                                    <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-slate-700 focus:ring-2 ring-blue-100 outline-none transition-all appearance-none" value={routineFormData.routeId} onChange={e => setRoutineFormData({ ...routineFormData, routeId: e.target.value })} required>
                                        <option value="">เลือกเส้นทาง...</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.originStation.stationName} → {r.destinationStation.stationName}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เวลาเดินรถ (ประจำวัน)</label>
                                    <input type="time" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-slate-700 focus:ring-2 ring-blue-100 outline-none transition-all" value={routineFormData.departureTime} onChange={e => setRoutineFormData({ ...routineFormData, departureTime: e.target.value })} required />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">คนขับรถประจำ</label>
                                        <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-slate-700 focus:ring-2 ring-blue-100 outline-none transition-all appearance-none" value={routineFormData.driverId} onChange={e => setRoutineFormData({ ...routineFormData, driverId: e.target.value })} required>
                                            <option value="">เลือกคนขับ...</option>
                                            {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รถตู้ประจำรอบ</label>
                                        <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-slate-700 focus:ring-2 ring-blue-100 outline-none transition-all appearance-none" value={routineFormData.vehicleId} onChange={e => setRoutineFormData({ ...routineFormData, vehicleId: e.target.value })} required>
                                            <option value="">เลือกรถ...</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" type="button" className="flex-1 py-4 rounded-2xl font-black uppercase text-xs" onClick={() => setIsRoutineModalOpen(false)}>ยกเลิก</Button>
                                    <Button type="submit" className="flex-1 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-200">ยืนยันข้อมูล</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminGuard>
    )
}
