'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button } from '../../components/UI'
import {
    MapPin,
    Plus,
    Trash2,
    Edit,
    Search,
    X,
    Check,
    AlertCircle,
    ArrowRight,
    Navigation,
    DollarSign,
    Clock
} from 'lucide-react'
import AdminGuard from '../../components/AdminGuard'
import { authFetch } from '../../utils/api'
import Swal from 'sweetalert2'
import { Route, Station } from '../../types'

export default function AdminRoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([])
    const [stations, setStations] = useState<Station[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoute, setEditingRoute] = useState<Route | null>(null)
    const [formData, setFormData] = useState({
        originStationId: '',
        destinationStationId: '',
        basePrice: '',
        estimatedDuration: '',
        isActive: true
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [routesRes, stationsRes] = await Promise.all([
                authFetch('http://localhost:8080/api/admin/routes'),
                authFetch('http://localhost:8080/api/admin/stations')
            ])

            if (routesRes.ok && stationsRes.ok) {
                const routesData = await routesRes.json()
                const stationsData = await stationsRes.json()
                setRoutes(routesData)
                setStations(stationsData)
            }
        } catch (error) {
            console.error('Failed to fetch data', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณต้องการลบเส้นทางนี้ใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true
        })

        if (result.isConfirmed) {
            try {
                const res = await authFetch(`http://localhost:8080/api/admin/routes/${id}`, {
                    method: 'DELETE'
                })

                if (res.ok) {
                    Swal.fire('ลบแล้ว!', 'ลบข้อมูลเส้นทางเรียบร้อยแล้ว', 'success')
                    setRoutes(routes.filter(r => r.id !== id))
                }
            } catch (error) {
                Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error')
            }
        }
    }

    const handleEdit = (route: Route) => {
        setEditingRoute(route)
        setFormData({
            originStationId: route.originStation.id.toString(),
            destinationStationId: route.destinationStation.id.toString(),
            basePrice: route.basePrice.toString(),
            estimatedDuration: route.estimatedDuration?.toString() || '',
            isActive: route.isActive
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Find full station objects to match backend expectation if it doesn't use ID-only DTOs
            // Most Spring JPA setups with @ManyToOne prefer the full object or at least an object with ID
            const originObj = stations.find(s => s.id === Number(formData.originStationId))
            const destObj = stations.find(s => s.id === Number(formData.destinationStationId))

            const payload = {
                originStation: originObj,
                destinationStation: destObj,
                basePrice: Number(formData.basePrice),
                estimatedDuration: Number(formData.estimatedDuration),
                isActive: formData.isActive
            }

            const url = editingRoute
                ? `http://localhost:8080/api/admin/routes/${editingRoute.id}`
                : 'http://localhost:8080/api/admin/routes'
            const method = editingRoute ? 'PUT' : 'POST'

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: editingRoute ? 'อัปเดตสำเร็จ' : 'เพิ่มสำเร็จ',
                    timer: 1500
                })
                setIsModalOpen(false)
                fetchData()
            } else {
                throw new Error('Failed to save route')
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: error.message || 'ไม่สามารถบันทึกข้อมูลได้'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <Navigation className="text-blue-600" />
                                จัดการเส้นทางเดินรถ
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">กำหนดเส้นทาง ราคา และเวลาเดินทางโดยประมาณ</p>
                        </div>
                        <Button
                            variant="primary"
                            icon={<Plus size={18} />}
                            onClick={() => {
                                setEditingRoute(null)
                                setFormData({ originStationId: '', destinationStationId: '', basePrice: '', estimatedDuration: '', isActive: true })
                                setIsModalOpen(true)
                            }}
                        >
                            เพิ่มเส้นทางใหม่
                        </Button>
                    </div>

                    {/* Table */}
                    <Card className="overflow-hidden p-0 border-none shadow-xl shadow-slate-200/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold">
                                        <th className="px-6 py-4">เส้นทาง (ต้นทาง → ปลายทาง)</th>
                                        <th className="px-6 py-4 text-center">ราคาพื้นฐาน</th>
                                        <th className="px-6 py-4 text-center">เวลาเดินทาง (นาที)</th>
                                        <th className="px-6 py-4 text-center">สถานะ</th>
                                        <th className="px-6 py-4 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading && routes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                                <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
                                            </td>
                                        </tr>
                                    ) : routes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-medium">ไม่พบข้อมูลเส้นทางเดินรถ</p>
                                            </td>
                                        </tr>
                                    ) : routes.map((route) => (
                                        <tr key={route.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="font-bold text-slate-800 flex items-center gap-3">
                                                        <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{route.originStation.stationName}</span>
                                                        <ArrowRight size={16} className="text-slate-400" />
                                                        <span className="text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{route.destinationStation.stationName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-700">
                                                {route.basePrice.toLocaleString()} ฿
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-600 italic">
                                                {route.estimatedDuration || '-'} นาที
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {route.isActive ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">เปิดใช้งาน</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">ปิดชั่วคราว</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(route)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(route.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900">
                                    {editingRoute ? 'แก้ไขข้อมูลเส้นทาง' : 'เพิ่มเส้นทางใหม่'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">สถานีต้นทาง</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                                            value={formData.originStationId}
                                            onChange={(e) => setFormData({ ...formData, originStationId: e.target.value })}
                                            required
                                        >
                                            <option value="">เลือกสถานี...</option>
                                            {stations.map(s => (
                                                <option key={s.id} value={s.id}>{s.stationName} ({s.province})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">สถานีปลายทาง</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                                            value={formData.destinationStationId}
                                            onChange={(e) => setFormData({ ...formData, destinationStationId: e.target.value })}
                                            required
                                        >
                                            <option value="">เลือกสถานี...</option>
                                            {stations.map(s => (
                                                <option key={s.id} value={s.id} disabled={s.id === Number(formData.originStationId)}>
                                                    {s.stationName} ({s.province})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                <DollarSign size={14} /> ราคาพื้นฐาน
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                                                placeholder="80"
                                                value={formData.basePrice}
                                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                <Clock size={14} /> เวลาเดินทาง (นาที)
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                                                placeholder="90"
                                                value={formData.estimatedDuration}
                                                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">
                                            เปิดใช้งานเส้นทางนี้
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                                        ยกเลิก
                                    </Button>
                                    <Button type="submit" loading={loading} icon={<Check size={18} />}>
                                        บันทึกข้อมูล
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminGuard>
    )
}
