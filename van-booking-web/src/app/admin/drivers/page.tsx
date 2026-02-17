'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button } from '../../components/UI'
import { Input } from '../../components/Form'
import {
    Users,
    UserPlus,
    Upload,
    Trash2,
    Edit,
    Search,
    X,
    Check,
    AlertCircle,
    FileText,
    Mail,
    Phone,
    User as UserIcon
} from 'lucide-react'
import AdminGuard from '../../components/AdminGuard'
import { authFetch } from '../../utils/api'
import Swal from 'sweetalert2'
import { User } from '../../types'

export default function AdminDriversPage() {
    const [drivers, setDrivers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDriver, setEditingDriver] = useState<User | null>(null)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: ''
    })

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        setLoading(true)
        try {
            const res = await authFetch('http://localhost:8080/api/admin/drivers')
            if (res.ok) {
                const data = await res.json()
                setDrivers(data)
            }
        } catch (error) {
            console.error('Failed to fetch drivers', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const res = await authFetch('http://localhost:8080/api/admin/drivers/import', {
                method: 'POST',
                // authFetch headers logic handles Authorization, but we need to let the browser set Content-Type for FormData
                body: formData
            })

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'นำเข้าข้อมูลสำเร็จ',
                    timer: 2000
                })
                fetchDrivers()
            } else {
                throw new Error('Import failed')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถนำเข้าข้อมูลจากไฟล์ CSV ได้'
            })
        } finally {
            setLoading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณต้องการลบรายชื่อคนขับรถนี้ใช่หรือไม่?",
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
                const res = await authFetch(`http://localhost:8080/api/admin/drivers/${id}`, {
                    method: 'DELETE'
                })

                if (res.ok) {
                    Swal.fire('ลบแล้ว!', 'ลบข้อมูลคนขับรถเรียบร้อยแล้ว', 'success')
                    setDrivers(drivers.filter(d => d.id !== id))
                }
            } catch (error) {
                Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error')
            }
        }
    }

    const handleEdit = (driver: User) => {
        setEditingDriver(driver)
        setFormData({
            username: driver.username,
            email: driver.email || '',
            password: '', // Don't show password
            fullName: driver.fullName,
            phoneNumber: driver.phoneNumber || ''
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = editingDriver
                ? `http://localhost:8080/api/admin/drivers/${editingDriver.id}`
                : 'http://localhost:8080/api/admin/drivers'
            const method = editingDriver ? 'PUT' : 'POST'

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: editingDriver ? 'อัปเดตสำเร็จ' : 'เพิ่มสำเร็จ',
                    timer: 1500
                })
                setIsModalOpen(false)
                fetchDrivers()
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

    const filteredDrivers = drivers.filter(d =>
        d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <Users className="text-blue-600" />
                                จัดการรายชื่อคนขับรถ
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">เพิ่ม ลบ แก้ไข และนำเข้าข้อมูลคนขับรถเข้าระบบ</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleImportCsv}
                                />
                                <Button variant="outline" icon={<Upload size={18} />}>
                                    นำเข้า CSV
                                </Button>
                            </label>
                            <Button
                                variant="primary"
                                icon={<UserPlus size={18} />}
                                onClick={() => {
                                    setEditingDriver(null)
                                    setFormData({ username: '', email: '', password: '', fullName: '', phoneNumber: '' })
                                    setIsModalOpen(true)
                                }}
                            >
                                เพิ่มคนขับรถ
                            </Button>
                        </div>
                    </div>

                    {/* Stats or Search */}
                    <Card className="p-4 rounded-2xl flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ, อีเมล หรือชื่อผู้ใช้..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold">
                            <span>ทั้งหมด: {drivers.length}</span>
                        </div>
                    </Card>

                    {/* Table */}
                    <Card className="overflow-hidden p-0 border-none shadow-xl shadow-slate-200/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white font-bold">
                                        <th className="px-6 py-4">ข้อมูลคนขับ</th>
                                        <th className="px-6 py-4">ชื่อผู้ใช้ (Username)</th>
                                        <th className="px-6 py-4">เบอร์โทรศัพท์</th>
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
                                    ) : filteredDrivers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-medium">ไม่พบข้อมูลรายชื่อคนขับรถ</p>
                                            </td>
                                        </tr>
                                    ) : filteredDrivers.map((driver) => (
                                        <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                        {driver.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{driver.fullName}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Mail size={12} /> {driver.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">{driver.username}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {driver.phoneNumber || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(driver)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(driver.id)}
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

                    {/* CSV Template Info */}
                    <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
                        <AlertCircle className="text-blue-600 shrink-0" size={20} />
                        <div className="text-sm text-blue-700">
                            <strong>คำแนะนำการนำเข้า CSV:</strong> รูปแบบไฟล์ควรเป็น <code>username, email, password, fullName, phoneNumber</code> (มีหัวตารางบรรทัดแรก) และควรบันทึกแบบ UTF-8
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900">
                                    {editingDriver ? 'แก้ไขข้อมูลคนขับรถ' : 'เพิ่มคนขับรถใหม่'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="ชื่อผู้ใช้"
                                        placeholder="username"
                                        disabled={!!editingDriver}
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="อีเมล"
                                        type="email"
                                        placeholder="driver@mail.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <Input
                                    label={editingDriver ? "รหัสผ่านใหม่ (ว่างไว้ถ้าไม่ต้องการเปลี่ยน)" : "รหัสผ่าน"}
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingDriver}
                                />
                                <Input
                                    label="ชื่อ-นามสกุล"
                                    placeholder="นายคนขับ ใจดี"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="เบอร์โทรศัพท์"
                                    placeholder="081XXXXXXX"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />

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
