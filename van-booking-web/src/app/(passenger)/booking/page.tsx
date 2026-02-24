'use client'

import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { MapPin, Calendar, Clock, ChevronRight, Check, Info, ShieldCheck, User, Loader2, ChevronLeft, Link } from 'lucide-react'
import { Card, Button } from '../../components/UI'
import { Station, Route } from '../../types'
import MapComponent from '../../components/MapComponent'
import { useRouter } from 'next/navigation'
import { authFetch } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const BACKEND_URL = 'http://localhost:8080'

export default function BookingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [step, setStep] = useState(1)
  // Booking selections
  const [originId, setOriginId] = useState<string>('')
  const [destId, setDestId] = useState<string>('')
  const [travelDate, setTravelDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber)
    }
  }, [user])

  const [remark, setRemark] = useState<string>('')

  // Data states
  const [stations, setStations] = useState<Station[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [schedules, setSchedules] = useState<any[]>([])

  // UI States
  const [loading, setLoading] = useState(true)
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingStatus, setBookingStatus] = useState<{ success: boolean; message: string } | null>(null)

  // Booked seats state
  const [bookedSeats, setBookedSeats] = useState<number[]>([])
  const [loadingBookedSeats, setLoadingBookedSeats] = useState(false)

  // Selected route data
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [customPickupCoord, setCustomPickupCoord] = useState<[number, number] | null>(null)
  const [customDropoffCoord, setCustomDropoffCoord] = useState<[number, number] | null>(null)
  const [pinMode, setPinMode] = useState<'pickup' | 'dropoff' | 'none'>('none')

  const handleLocationSelect = (lat: number, lng: number) => {
    if (pinMode === 'pickup') {
      setCustomPickupCoord([lat, lng])
    } else if (pinMode === 'dropoff') {
      setCustomDropoffCoord([lat, lng])
    }
    setPinMode('none') // Auto-off after pin
  }

  // Reset custom locations if route changes
  useEffect(() => {
    setCustomPickupCoord(null)
    setCustomDropoffCoord(null)
  }, [originId, destId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [stationsRes, routesRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/stations`),
          fetch(`${BACKEND_URL}/api/routes`)
        ])

        if (!stationsRes.ok || !routesRes.ok) throw new Error('Failed to fetch data')

        const stationsData = await stationsRes.json()
        const routesData = await routesRes.json()

        setStations(stationsData)
        setRoutes(routesData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('ไม่สามารถโหลดข้อมูลได้ในขณะนี้')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update selected route and clear destination if invalid when origin changes
  useEffect(() => {
    if (originId) {
      const validDestinations = routes
        .filter(r => r.originStation.id.toString() === originId)
        .map(r => r.destinationStation.id.toString())

      if (destId && !validDestinations.includes(destId)) {
        setDestId('')
      }
    } else {
      setDestId('')
    }
  }, [originId, routes])

  // Get current selected route and reset dependent states
  useEffect(() => {
    if (originId && destId) {
      const route = routes.find(r =>
        r.originStation.id.toString() === originId &&
        r.destinationStation.id.toString() === destId
      )
      setSelectedRoute(route || null)
      setSelectedScheduleId('') // Reset when route changes
    } else {
      setSelectedRoute(null)
      setSelectedScheduleId('')
    }
  }, [originId, destId, routes])

  // Fetch schedules when route and date are selected
  useEffect(() => {
    if (selectedRoute && travelDate) {
      const fetchSchedules = async () => {
        try {
          setSchedulesLoading(true)
          const res = await authFetch(`${BACKEND_URL}/api/schedules?routeId=${selectedRoute.id}&date=${travelDate}`)
          if (res.ok) {
            const data = await res.json()
            setSchedules(data)
          }
        } catch (err) {
          console.error('Error fetching schedules:', err)
        } finally {
          setSchedulesLoading(false)
        }
      }
      fetchSchedules()
    } else {
      setSchedules([])
    }
  }, [selectedRoute, travelDate])

  // Fetch booked seats when schedule changes
  useEffect(() => {
    if (selectedRoute && selectedScheduleId) {
      const fetchBookedSeats = async () => {
        try {
          setLoadingBookedSeats(true)
          const selectedSch = schedules.find(s => s.id.toString() === selectedScheduleId)
          if (!selectedSch) return

          const res = await authFetch(`${BACKEND_URL}/api/bookings/booked-seats?routeId=${selectedRoute.id}&departureTime=${encodeURIComponent(selectedSch.departureTime)}`)
          if (res.ok) {
            const data = await res.json()
            setBookedSeats(data)
          } else {
            setBookedSeats([])
          }
        } catch (err) {
          console.error('Error fetching booked seats:', err)
          setBookedSeats([])
        } finally {
          setLoadingBookedSeats(false)
        }
      }
      fetchBookedSeats()
    } else {
      setBookedSeats([])
    }
  }, [selectedScheduleId, selectedRoute, schedules])

  const handleBookingSubmit = async () => {
    if (!selectedRoute || !selectedScheduleId || !selectedSeat || !phoneNumber) return;

    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบก่อนทำการจอง',
        confirmButtonText: 'เข้าสู่ระบบ'
      }).then(() => {
        router.push('/login')
      })
      return
    }

    // Confirmation
    const result = await Swal.fire({
      title: 'ยืนยันการจอง?',
      text: `คุณต้องการจองที่นั่งเบอร์ ${selectedSeat} ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยันการจอง',
      cancelButtonText: 'ยกเลิก'
    })

    if (!result.isConfirmed) return

    try {
      setIsSubmitting(true)
      setError(null)

      const selectedSch = schedules.find(s => s.id.toString() === selectedScheduleId)

      const bookingRequest = {
        routeId: selectedRoute.id,
        departureTime: selectedSch?.departureTime,
        userId: user?.id,
        seatNumber: selectedSeat,
        pickupPoint: customPickupCoord ? `Custom (${customPickupCoord[0]}, ${customPickupCoord[1]})` : selectedRoute.originStation.stationName,
        pickupLat: customPickupCoord ? customPickupCoord[0] : null,
        pickupLng: customPickupCoord ? customPickupCoord[1] : null,
        dropoffPoint: customDropoffCoord ? `Custom (${customDropoffCoord[0]}, ${customDropoffCoord[1]})` : selectedRoute.destinationStation.stationName,
        dropoffLat: customDropoffCoord ? customDropoffCoord[0] : null,
        dropoffLng: customDropoffCoord ? customDropoffCoord[1] : null,
        contactPhone: phoneNumber,
        remark: remark,
        totalPrice: selectedRoute.basePrice // Removed +15 fee
      }

      const res = await authFetch(`${BACKEND_URL}/api/bookings/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRequest)
      })

      const rawResponse = await res.text()

      if (res.ok && rawResponse.startsWith('จองสำเร็จ:')) {
        const bookingId = rawResponse.split(':')[1]

        // If user uploaded a slip, verify it now
        if (slipFile) {
          setIsVerifying(true)
          const formData = new FormData()
          formData.append('file', slipFile)

          const verifyRes = await authFetch(`${BACKEND_URL}/api/payments/verify-slip/${bookingId}`, {
            method: 'POST',
            body: formData
          })

          const verifyData = await verifyRes.json()
          setIsVerifying(false)

          if (verifyRes.ok) {
            await Swal.fire({
              icon: 'success',
              title: 'ชำระเงินและจองสำเร็จ!',
              text: 'สลิปของคุณได้รับการตรวจสอบเรียบร้อยแล้ว',
              timer: 2000,
              showConfirmButton: false
            })
          } else {
            await Swal.fire({
              icon: 'warning',
              title: 'จองสำเร็จ แต่สลิปไม่ถูกต้อง',
              text: verifyData.message || 'สลิปของคุณไม่สามารถตรวจสอบได้ในขณะนี้ กรุณาลองใหม่ที่หน้ารายการจอง',
              confirmButtonText: 'รับทราบ'
            })
          }
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'จองที่นั่งสำเร็จ!',
            text: 'กรุณาแจ้งชำระเงินในภายหลังที่หน้ารายการจองของคุณ',
            timer: 2000,
            showConfirmButton: false
          })
        }

        router.push('/my-bookings')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'การจองล้มเหลว',
          text: rawResponse || 'ที่นั่งนี้อาจถูกจองไปแล้ว กรุณาเลือกที่นั่งใหม่',
          confirmButtonText: 'ตกลง'
        })
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถทำรายการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableDestinations = originId
    ? routes
      .filter(r => r.originStation.id.toString() === originId)
      .map(r => r.destinationStation)
    : []

  const steps = [
    { number: 1, label: 'เลือกเส้นทาง' },
    { number: 2, label: 'เลือกที่นั่ง' },
    { number: 3, label: 'ชำระเงิน' }
  ]

  const seats = Array.from({ length: 13 }, (_, i) => i + 1)

  const renderSeat = (seat: number) => {
    const isBooked = bookedSeats.includes(seat)
    return (
      <button
        key={seat}
        disabled={isBooked}
        onClick={() => !isBooked && setSelectedSeat(selectedSeat === seat ? null : seat)}
        className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-lg font-black transition-all group relative
          ${isBooked
            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
            : selectedSeat === seat
              ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-110 z-10'
              : 'bg-white border-slate-100 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:-translate-y-1'}`}
      >
        {seat}
        {selectedSeat === seat && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <header className="mb-12 text-center">

          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">จองที่นั่งรถตู้</h1>
          <p className="text-black max-w-xl mx-auto">จองที่นั่งง่ายๆ เพียง 3 ขั้นตอน พร้อมรับประกันความปลอดภัยตลอดการเดินทาง</p>
        </header>

        {/* Progress Stepper */}
        <div className="flex justify-center items-center gap-4 mb-12 sm:gap-12">
          {steps.map((s, i) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${s.number < step ? 'bg-blue-600 text-white' :
                  s.number === step ? 'bg-blue-600 text-black shadow-lg shadow-blue-200 scale-110' :
                    'bg-white text-black border border-slate-200'
                  }`}>
                  {s.number < step ? <Check size={20} /> : s.number}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${s.number === step ? 'text-black' : 'text-black'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="hidden sm:block w-20 h-0.5 bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form / Seat Selection */}
          <div className="lg:col-span-8 space-y-8">
            <Card
              title={step === 1 ? "ข้อมูลการเดินทาง" : "แผนผังที่นั่ง"}
              description={step === 1 ? "ระบุจุดรับและเวลาที่ต้องการเดินทาง" : "เลือกที่นั่งที่คุณต้องการจากแผนผังรถ"}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลการเดินรถ...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <Info size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-900 font-bold">{error}</p>
                    <p className="text-slate-500 text-sm">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                  </div>
                  <Button variant="outline" onClick={() => window.location.reload()}>ลองอีกครั้ง</Button>
                </div>
              ) : step === 1 ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black ml-1">จุดรับผู้โดยสาร</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black font-medium"
                          value={originId}
                          onChange={(e) => setOriginId(e.target.value)}
                        >
                          <option value="">เลือกจุดรับ</option>
                          {stations.map(station => (
                            <option key={station.id} value={station.id}>
                              {station.province} - {station.stationName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black ml-1">จุดหมายปลายทาง</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                        <select
                          className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black font-medium"
                          value={destId}
                          onChange={(e) => setDestId(e.target.value)}
                        >
                          <option value="">เลือกจุดหมาย</option>
                          {availableDestinations.map(station => (
                            <option key={station.id} value={station.id}>
                              {station.province} - {station.stationName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black ml-1">วันที่เดินทาง</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                        <input
                          type="date"
                          min={new Date().toLocaleDateString('en-CA')}
                          max={new Date(new Date().setMonth(new Date().getMonth() + 3)).toLocaleDateString('en-CA')} // Limit to 3 months in advance
                          className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black font-medium"
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black ml-1">เวลารอบรถ</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                        <select
                          className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black font-medium disabled:opacity-50"
                          value={selectedScheduleId}
                          onChange={(e) => setSelectedScheduleId(e.target.value)}
                          disabled={!selectedRoute || !travelDate || schedulesLoading}
                        >
                          <option value="">
                            {schedulesLoading ? 'กำลังโหลดรอบรถ...' :
                              !selectedRoute ? 'กรุณาเลือกเส้นทางก่อน' :
                                !travelDate ? 'กรุณาเลือกวันที่เดินทาง' : 'เลือกเวลารถ'}
                          </option>
                          {schedules
                            .filter(sch => new Date(sch.departureTime) > new Date()) // Filter out past schedules
                            .map(sch => (
                              <option key={sch.id} value={sch.id.toString()}>
                                {new Date(sch.departureTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                              </option>
                            ))}
                          {!schedulesLoading && selectedRoute && travelDate && schedules.length === 0 && (
                            <option value="" disabled>ไม่มีรอบรถให้บริการในวันที่เลือก</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Route Visualization */}
                  {selectedRoute && (
                    <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm bg-white p-2">
                      <div className="p-4 flex gap-4">
                        <button
                          onClick={() => setPinMode(pinMode === 'pickup' ? 'none' : 'pickup')}
                          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2
                          ${pinMode === 'pickup' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        >
                          <MapPin size={16} /> {customPickupCoord ? 'เปลี่ยนจุดรับ' : 'ปักหมุดจุดรับพิเศษ'}
                        </button>
                        <button
                          onClick={() => setPinMode(pinMode === 'dropoff' ? 'none' : 'dropoff')}
                          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2
                          ${pinMode === 'dropoff' ? 'bg-red-600 text-white shadow-lg' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        >
                          <MapPin size={16} /> {customDropoffCoord ? 'เปลี่ยนจุดส่ง' : 'ปักหมุดจุดส่งพิเศษ'}
                        </button>
                      </div>

                      <div className="h-[300px] w-full">
                        <MapComponent
                          originName={selectedRoute.originStation.stationName + ', ' + selectedRoute.originStation.province}
                          destinationName={selectedRoute.destinationStation.stationName + ', ' + selectedRoute.destinationStation.province}
                          onPickupSelected={(lat, lng) => handleLocationSelect(lat, lng)}
                          onDropoffSelected={(lat, lng) => handleLocationSelect(lat, lng)}
                          selectedPickupCoord={customPickupCoord}
                          selectedDropoffCoord={customDropoffCoord}
                          pinMode={pinMode}
                        />
                      </div>

                      <div className="p-4 space-y-3">
                        {customPickupCoord && (
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 animate-fade-in">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                              <MapPin size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">จุดรับพิเศษที่เลือก</p>
                              <p className="text-xs text-blue-900 font-bold truncate">พิกัด: {customPickupCoord[0].toFixed(5)}, {customPickupCoord[1].toFixed(5)}</p>
                            </div>
                            <button onClick={() => setCustomPickupCoord(null)} className="text-blue-400 hover:text-red-500"><Check size={16} /></button>
                          </div>
                        )}

                        {customDropoffCoord && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-fade-in">
                            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shrink-0">
                              <MapPin size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">จุดส่งพิเศษที่เลือก</p>
                              <p className="text-xs text-red-900 font-bold truncate">พิกัด: {customDropoffCoord[0].toFixed(5)}, {customDropoffCoord[1].toFixed(5)}</p>
                            </div>
                            <button onClick={() => setCustomDropoffCoord(null)} className="text-red-400 hover:text-red-500"><Check size={16} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1 mb-2 block">เบอร์โทรศัพท์ติดต่อ</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Clock size={16} /></div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setPhoneNumber(val)
                          }}
                          placeholder="08X-XXXXXXX"
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm font-bold text-black transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1 mb-2 block">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="เช่น รอหน้าเซเว่น, มีกระเป๋าใบใหญ่"
                        className="w-full p-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-sm font-bold text-black transition-all min-h-[80px] placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full h-14"
                      onClick={() => {
                        if (!user) {
                          Swal.fire({
                            icon: 'warning',
                            title: 'กรุณาเข้าสู่ระบบ',
                            text: 'คุณต้องเข้าสู่ระบบก่อนทำการเลือกที่นั่งและจองรถตู้',
                            confirmButtonText: 'เข้าสู่ระบบ',
                            showCancelButton: true,
                            cancelButtonText: 'ยกเลิก'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              router.push('/login')
                            }
                          })
                          return
                        }
                        setStep(2)
                      }}
                      disabled={!originId || !destId || !travelDate || !selectedScheduleId || !selectedRoute || !phoneNumber}
                    >
                      {!selectedRoute && originId && destId ? 'ไม่มีเส้นทางให้บริการ' : 'ถัดไป: เลือกที่นั่ง'} <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="animate-fade-in space-y-8">
                  <div className="max-w-[560px] mx-auto bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 relative shadow-inner">
                    <div className="absolute top-8 right-12 text-[10px] font-black uppercase text-black border border-slate-200 px-3 py-1.5 rounded-full bg-white shadow-sm">
                      พื้นที่คนขับ
                    </div>

                    <div className="flex flex-row gap-6 pt-16 overflow-x-auto pb-6 justify-center">
                      {/* Van Layout - Column based as per image */}
                      <div className="flex flex-col gap-4 min-w-[64px]">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 grayscale border-2 border-slate-300 shadow-inner">
                          <User size={28} />
                        </div>
                        <div className="w-16 h-16 bg-slate-200/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(203,213,225,0.4)_5px,rgba(203,213,225,0.4)_10px)]" />
                        </div>
                        {renderSeat(1)}
                      </div>
                      <div className="flex flex-col gap-4 min-w-[64px]">
                        {renderSeat(4)}
                        {renderSeat(3)}
                        {renderSeat(2)}
                      </div>
                      <div className="flex flex-col gap-4 min-w-[64px]">
                        {renderSeat(7)}
                        {renderSeat(6)}
                        <div className="h-8" />
                        {renderSeat(5)}
                      </div>
                      <div className="flex flex-col gap-4 min-w-[64px]">
                        {renderSeat(10)}
                        {renderSeat(9)}
                        <div className="h-8" />
                        {renderSeat(8)}
                      </div>
                      <div className="flex flex-col gap-4 min-w-[64px]">
                        {renderSeat(13)}
                        {renderSeat(12)}
                        <div className="h-8" />
                        {renderSeat(11)}
                      </div>
                    </div>

                    <div className="mt-10 flex justify-center gap-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-black"><div className="w-4 h-4 bg-white border-2 border-slate-100 rounded" /> ว่าง</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-black"><div className="w-4 h-4 bg-blue-600 rounded" /> เลือกอยู่</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-black"><div className="w-4 h-4 bg-slate-200 rounded opacity-50" /> จองแล้ว</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14" onClick={() => setStep(1)}>ย้อนกลับ</Button>
                    <Button
                      className="flex-[2] h-14"
                      disabled={!selectedSeat}
                      onClick={() => setStep(3)}
                    >
                      ถัดไป: ชำระเงิน {selectedSeat && `(ที่นั่ง ${selectedSeat})`} <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in space-y-8">
                  <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 text-center space-y-6">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm mx-auto">
                      <ShieldCheck size={40} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">สรุปการจองและชำระเงิน</h3>
                      <p className="text-sm text-black">กรุณาตรวจสอบข้อมูลการจองของคุณก่อนยืนยันการชำระเงิน</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 text-left border border-slate-100">
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                        <span className="text-black">ที่นั่งที่เลือก</span>
                        <span className="font-bold text-slate-900 text-lg">เบอร์ {selectedSeat}</span>
                      </div>
                      <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Scan QR เพื่อชำระเงิน</p>
                          <div className="bg-white p-2 border-2 border-blue-50 rounded-2xl">
                            <img
                              src={`https://promptpay.io/0909728265/${selectedRoute?.basePrice}.png`}
                              alt="PromptPay QR Code"
                              className="w-48 h-48 mx-auto"
                            />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-bold text-slate-900 italic">พร้อมเพย์ (PromptPay)</p>
                          <p className="text-xs font-medium text-slate-500">เบอร์โทรศัพท์: <span className="text-blue-600 font-bold">090-972-8265</span></p>
                          <p className="text-xs font-medium text-slate-500">ชื่อบัญชี: <span className="text-slate-900 font-bold uppercase">Jetsada P.</span></p>
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] text-slate-400 text-center italic">
                        * ระบบจะตรวจสอบไฟล์สลิปอัตโนมัติเมื่อท่านอัปโหลด
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <label className="text-sm font-bold text-slate-900 ml-1">อัปโหลดสลิปเพื่อยืนยันทันที (แนะนำ)</label>
                      <div className={`relative border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center gap-3
                        ${slipFile ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {slipFile ? (
                          <>
                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                              <Check size={24} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-emerald-900">{slipFile.name}</p>
                              <p className="text-xs text-emerald-600">กดปุ่มยืนยันข้างล่างเพื่อตรวจสอบสลิป</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                              <Link size={24} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">คลิกหรือลากไฟล์สลิปมาวางที่นี่</p>
                              <p className="text-xs text-slate-500">รองรับไฟล์ภาพ JPG, PNG</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14" onClick={() => setStep(2)} disabled={isSubmitting}>ย้อนกลับ</Button>
                    <Button
                      className={`flex-[2] h-14 ${slipFile ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600'}`}
                      onClick={handleBookingSubmit}
                      disabled={isSubmitting || isVerifying}
                    >
                      {isVerifying ? (
                        <>กำลังตรวจสอบสลิป... <Loader2 size={18} className="animate-spin ml-2" /></>
                      ) : isSubmitting ? (
                        <>กำลังบันทึกการจอง... <Loader2 size={18} className="animate-spin ml-2" /></>
                      ) : slipFile ? (
                        <>ตรวจสอบสลิปและจองทันที <Check size={18} className="ml-2" /></>
                      ) : (
                        <>ยืนยันการจอง (ชำระเงินภายหลัง) <ChevronRight size={18} className="ml-2" /></>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <div className="flex items-center gap-4 p-6 bg-blue-50 border border-blue-100 rounded-3xl text-blue-800">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <Info size={24} />
              </div>
              <p className="text-sm font-medium leading-relaxed">
                <strong>ข้อแนะนำ:</strong> กรุณามาถึงจุดรับอย่างน้อย 15 นาทีก่อนเวลาเดินทาง ระบบจะแจ้งเตือนคุณผ่านทางเบอร์โทรศัพท์เมื่อรถเข้าใกล้จุดรับ
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card title="สรุปการจอง" className="sticky top-24 border-blue-100">
              <div className="space-y-6">
                <div className="space-y-4 pb-6 border-b border-slate-50">
                  <div className="flex justify-between">
                    <span className="text-black text-sm">เส้นทาง</span>
                    <span className="font-bold text-slate-900 text-sm text-right">
                      {selectedRoute ? `${selectedRoute.originStation.stationName} - ${selectedRoute.destinationStation.stationName}` : 'รอเลือกข้อมูล'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black text-sm">เวลาเดินทาง</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedScheduleId ?
                        schedules.find(s => s.id.toString() === selectedScheduleId)?.departureTime?.split('T')[1].substring(0, 5)
                        : '--:--'} น. | {travelDate || '--/--/--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black text-sm">ที่นั่งที่เลือก</span>
                    <span className={`font-bold text-sm ${selectedSeat ? 'text-blue-600' : 'text-slate-400'}`}>
                      {selectedSeat ? `เบอร์ ${selectedSeat}` : 'รอเลือกที่นั่ง'}
                    </span>
                  </div>
                  {customPickupCoord && (
                    <div className="flex flex-col gap-1 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-wider">จุดรับพิเศษ</span>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                      <span className="font-bold text-blue-900 text-xs truncate">
                        {customPickupCoord[0].toFixed(5)}, {customPickupCoord[1].toFixed(5)}
                      </span>
                    </div>
                  )}
                  {customDropoffCoord && (
                    <div className="flex flex-col gap-1 p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                      <div className="flex justify-between items-center">
                        <span className="text-red-600 text-[10px] font-black uppercase tracking-wider">จุดส่งพิเศษ</span>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <span className="font-bold text-red-900 text-xs truncate">
                        {customDropoffCoord[0].toFixed(5)}, {customDropoffCoord[1].toFixed(5)}
                      </span>
                    </div>
                  )}
                  {phoneNumber && (
                    <div className="flex justify-between items-center py-2 border-t border-slate-50 mt-2">
                      <span className="text-black text-[10px] font-black uppercase tracking-widest">เบอร์ติดต่อ</span>
                      <span className="font-black text-blue-600 text-sm">{phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-black">ราคาบัตรโดยสาร</span>
                    <span className="font-bold">฿{selectedRoute ? selectedRoute.basePrice.toFixed(2) : '0.00'}</span>
                  </div>
                  {/* Fee removed */}
                  <div className="flex justify-between items-end pt-4">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">ยอดชำระรวม</span>
                    <span className="text-3xl font-black text-blue-600">
                      ฿{selectedRoute ? selectedRoute.basePrice.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 p-2 rounded-lg mb-4 justify-center">
                    <ShieldCheck size={14} /> Secure Payment Encryption
                  </div>
                  <Button variant="secondary" className="w-full h-14" disabled={!selectedSeat || step !== 3}>
                    ดำเนินการชำระเงิน
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
      </div>
    </div>
  )
}