'use client'

import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login')
            } else if (user.role !== 'ADMIN') {
                router.push('/')
            }
        }
    }, [user, isLoading, router])

    if (isLoading || !user || user.role !== 'ADMIN') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg italic">กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
