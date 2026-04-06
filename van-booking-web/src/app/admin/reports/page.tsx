'use client'

import React, { useEffect, useState } from 'react'
import { Card, Button } from '../../components/UI'
import { authFetch } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import AdminGuard from '../../components/AdminGuard'
import { User, Calendar, MessageSquare, Star, CheckCircle, Clock } from 'lucide-react'
import Swal from 'sweetalert2'

const BACKEND_URL = 'http://localhost:8081'

export default function AdminReportsPage() {
    const { user } = useAuth()
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await authFetch(`${BACKEND_URL}/api/reports`)
            if (res.ok) {
                const data = await res.json()
                setReports(data)
            }
        } catch (err) {
            console.error('Failed to fetch reports:', err)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await authFetch(`${BACKEND_URL}/api/reports/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                Swal.fire('สำเร็จ', 'อัปเดตสถานะรายงานแล้ว', 'success')
                setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
            }
        } catch (err) {
            Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error')
        }
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 text-slate-900 font-sans">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
                                Driver <span className="text-blue-600">Reports</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                                ระบบรับเรื่องร้องเรียนและประเมินผลคนขับรถ
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                            กำลังโหลดข้อมูลรายงาน...
                        </div>
                    ) : reports.length === 0 ? (
                        <Card className="p-20 text-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
                            <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
                            <p className="text-slate-400 font-black uppercase tracking-widest italic">ยังไม่มีรายงานในขณะนี้</p>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {reports.map((report) => (
                                <Card key={report.id} className="p-6 space-y-4 border-none shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all bg-white rounded-[2rem]">
                                    <div className="flex justify-between items-start">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${report.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                                              report.status === 'REVIEWED' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                            {report.status}
                                        </div>
                                        <div className="flex text-amber-400">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} size={14} fill={i < report.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">ผู้ถูกร้องเรียน (คนขับ)</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs uppercase italic">
                                                    {report.driver?.fullName?.[0]}
                                                </div>
                                                <p className="font-black text-slate-900">{report.driver?.fullName}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">รายละเอียดปัญหา</p>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                                "{report.reason}"
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ผู้แจ้ง</p>
                                                <p className="text-xs font-bold text-slate-600">{report.reporter?.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">วันที่แจ้ง</p>
                                                <p className="text-xs font-bold text-slate-600">{new Date(report.createdAt).toLocaleDateString('th-TH')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-2">
                                        {report.status === 'PENDING' && (
                                            <Button 
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl"
                                                onClick={() => updateStatus(report.id, 'REVIEWED')}
                                            >
                                                <Clock size={14} className="mr-2" /> Mark Review
                                            </Button>
                                        )}
                                        {report.status !== 'RESOLVED' && (
                                            <Button 
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl"
                                                onClick={() => updateStatus(report.id, 'RESOLVED')}
                                            >
                                                <CheckCircle size={14} className="mr-2" /> Resolved
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    )
}
