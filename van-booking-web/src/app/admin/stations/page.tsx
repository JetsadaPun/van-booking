'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button } from '../../components/UI'
import { Input } from '../../components/Form'
import {
    MapPin,
    Plus,
    Trash2,
    Edit,
    Search,
    X,
    Check,
    AlertCircle,
    Home
} from 'lucide-react'
import AdminGuard from '../../components/AdminGuard'
import { authFetch } from '../../utils/api'
import Swal from 'sweetalert2'
import { Station } from '../../types'

export default function AdminStationsPage() {
    const [stations, setStations] = useState<Station[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStation, setEditingStation] = useState<Station | null>(null)
    const [formData, setFormData] = useState({
        stationName: '',
        province: '',
        isMainHub: false
    })

    useEffect(() => {
        fetchStations()
    }, [])

    const fetchStations = async () => {
        setLoading(true)
        try {
            const res = await authFetch('http://localhost:8080/api/admin/stations')
            if (res.ok) {
                const data = await res.json()
                setStations(data)
            }
        } catch (error) {
            console.error('Failed to fetch stations', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณต้องการลบสถานีนี้ใช่หรือไม่?",
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
                const res = await authFetch(`http://localhost:8080/api/admin/stations/${id}`, {
                    method: 'DELETE'
                })

                if (res.ok) {
                    Swal.fire('ลบแล้ว!', 'ลบข้อมูลสถานีเรียบร้อยแล้ว', 'success')
                    setStations(stations.filter(s => s.id !== id))
                }
            } catch (error) {
                Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error')
            }
        }
    }

    const handleEdit = (station: Station) => {
        setEditingStation(station)
        setFormData({
            stationName: station.stationName,
            province: station.province,
            isMainHub: station.isMainHub
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = editingStation
                ? `http://localhost:8080/api/admin/stations/${editingStation.id}`
                : 'http://localhost:8080/api/admin/stations'
            const method = editingStation ? 'PUT' : 'POST'

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: editingStation ? 'อัปเดตสำเร็จ' : 'เพิ่มสำเร็จ',
                    timer: 1500
                })
                setIsModalOpen(false)
                fetchStations()
            } else {
                const errorData = await res.text()
                throw new Error(errorData)
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

    const filteredStations = stations.filter(s =>
        s.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.province.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <Home className="text-blue-600" />
                                จัดการรายชื่อสถานี
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">เพิ่ม ลบ แก้ไข ข้อมูลจุดรับส่งผู้โดยสาร</p>
                        </div>
                        <Button
                            variant="primary"
                            icon={<Plus size={18} />}
                            onClick={() => {
                                setEditingStation(null)
                                setFormData({ stationName: '', province: '', isMainHub: false })
                                setIsModalOpen(true)
                            }}
                        >
                            เพิ่มสถานีใหม่
                        </Button>
                    </div>

                    {/* Search */}
                    <Card className="p-4 rounded-2xl flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อสถานี หรือจังหวัด..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold">
                            <span>ทั้งหมด: {stations.length}</span>
                        </div>
                    </Card>

                    {/* Table */}
                    <Card className="overflow-hidden p-0 border-none shadow-xl shadow-slate-200/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold">
                                        <th className="px-6 py-4">ชื่อสถานี</th>
                                        <th className="px-6 py-4">จังหวัด</th>
                                        <th className="px-6 py-4 text-center">ประเภท</th>
                                        <th className="px-6 py-4 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                                <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
                                            </td>
                                        </tr>
                                    ) : filteredStations.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-medium">ไม่พบข้อมูลรายชื่อสถานี</p>
                                            </td>
                                        </tr>
                                    ) : filteredStations.map((station) => (
                                        <tr key={station.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div className="font-bold text-slate-900">{station.stationName}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">{station.province}</td>
                                            <td className="px-6 py-4 text-center">
                                                {station.isMainHub ? (
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">สถานีหลัก</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">จุดจอด</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(station)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(station.id)}
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
                                    {editingStation ? 'แก้ไขข้อมูลสถานี' : 'เพิ่มสถานีใหม่'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                                <Input
                                    label="ชื่อสถานี"
                                    placeholder="เช่น มก. กำแพงแสน"
                                    value={formData.stationName}
                                    onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="จังหวัด"
                                    placeholder="เช่น นครปฐม"
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                    required
                                />
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <input
                                        type="checkbox"
                                        id="isMainHub"
                                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={formData.isMainHub}
                                        onChange={(e) => setFormData({ ...formData, isMainHub: e.target.checked })}
                                    />
                                    <label htmlFor="isMainHub" className="font-bold text-slate-700 cursor-pointer">
                                        ตั้งเป็นสถานีหลัก (Main Hub)
                                    </label>
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
