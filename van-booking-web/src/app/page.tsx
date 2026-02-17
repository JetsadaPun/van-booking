
'use client'

import React from 'react'
import Link from 'next/link'
import { Bus, Ticket, Zap, Star } from 'lucide-react'
import { Button } from './components/UI'

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold animate-fade-in">
              <Zap size={16} fill="currentColor" /> จองรถตู้ออนไลน์ได้แล้ววันนี้
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
              เดินทางมั่นใจ <br />
              <span className="text-blue-600 relative inline-block">
                จองผ่านเว็บ
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span> ได้ทันที
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              VanBooking แพลตฟอร์มจองรถตู้อัจฉริยะที่ช่วยให้คุณเลือกที่นั่ง
              ระบุจุดรับ-ส่ง และเดินทางได้อย่างปลอดภัยด้วยมาตรฐานสากล
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Link href="/booking">
                <Button size="lg" icon={<Ticket size={20} />}>จองที่นั่งตอนนี้</Button>
              </Link>
            </div>


          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-1.5 rounded text-white">
            <Bus size={16} />
          </div>
          <span className="font-bold text-slate-900">VanBooking</span>
        </div>
        <p className="text-slate-500 text-sm">&copy; 2024 VanBooking System. ยกระดับการเดินทางด้วยเทคโนโลยี</p>
        <div className="flex gap-6 text-sm font-medium text-slate-400">
          <Link href="#" className="hover:text-slate-900 transition-colors">นโยบายความเป็นส่วนตัว</Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">เงื่อนไขการใช้งาน</Link>
        </div>
      </footer>

    </div>
  )
}
