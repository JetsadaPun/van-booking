'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Coordinates for stations defined in schema.sql
const STATION_COORDS: Record<string, [number, number]> = {
    'มก. กำแพงแสน': [14.0227, 99.9723],
    'องค์พระปฐมเจดีย์': [13.8196, 100.0601],
    'มหาวิทยาลัยมหิดล ศาลายา': [13.7934, 100.3225],
    'มหาวิทยาลัยศิลปากร / พระราชวังสนามจันทร์': [13.8193, 100.0445],
    'เซ็นทรัล นครปฐม': [13.8126, 100.0401],
    'ตลาดท่านา (นครชัยศรี)': [13.8175, 100.1834],
    'เซ็นทรัล เวสต์เกต (บางใหญ่)': [13.8762, 100.4114],
    'เดอะมอลล์ งามวงศ์วาน': [13.8596, 100.5432],
    'เมืองทองธานี (อิมแพ็ค)': [13.9114, 100.5491],
    'ปากเกร็ด / แจ้งวัฒนะ': [13.9079, 100.4996],
    'สถานีรถไฟฟ้า MRT สายสีม่วง': [13.8601, 100.4123],
    'ฟิวเจอร์พาร์ค รังสิต': [13.9892, 100.6177],
    'มหาวิทยาลัยธรรมศาสตร์ / รพ.ธรรมศาสตร์': [14.0754, 100.6148],
    'มหาวิทยาลัยกรุงเทพ (รังสิต)': [14.0396, 100.6146],
    'นิคมอุตสาหกรรมนวนคร': [14.1206, 100.6063],
    'มก. บางเขน': [13.8476, 100.5696],
    'อนุสาวรีย์ชัยสมรภูมิ': [13.7649, 100.5383],
    'สถานีกลางกรุงเทพอภิวัฒน์ (บางซื่อ)': [13.8042, 100.5401],
    'สถานีขนส่งหมอชิต 2': [13.8131, 100.5489],
    'สถานีขนส่งสายใต้ใหม่ (บรมฯ)': [13.7806, 100.4229],
    'สนามบินดอนเมือง': [13.9126, 100.6067],
    'เอกมัย': [13.7191, 100.5843],
}

// Dynamic import for react-leaflet components to disable SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false })

// Helper component for map events
interface MapEventsProps {
    onLocationSelected: (lat: number, lng: number) => void;
    originCoord: [number, number] | null;
    destCoord: [number, number] | null;
    routePath: [number, number][];
    onDistanceError: (msg: string) => void;
}

function MapEvents({ onLocationSelected, originCoord, destCoord, routePath, onDistanceError }: MapEventsProps) {
    const { useMapEvents } = require('react-leaflet')

    // Function to calculate distance (Haversine)
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Function to calculate distance to line segment
    const getDistanceToSegment = (p: [number, number], a: [number, number], b: [number, number]) => {
        const [px, py] = p, [ax, ay] = a, [bx, by] = b
        const l2 = (ax - bx) ** 2 + (ay - by) ** 2
        if (l2 === 0) return getDistance(px, py, ax, ay)
        let t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2))
        return getDistance(px, py, ax + t * (bx - ax), ay + t * (by - ay))
    }

    useMapEvents({
        click(e: any) {
            if (!originCoord || !destCoord) return
            const clickedCoord: [number, number] = [e.latlng.lat, e.latlng.lng]

            // Check distance to all segments of the routePath
            let minDistance = Infinity;

            if (routePath.length > 1) {
                for (let i = 0; i < routePath.length - 1; i++) {
                    const dist = getDistanceToSegment(clickedCoord, routePath[i], routePath[i + 1]);
                    if (dist < minDistance) minDistance = dist;
                }
            } else {
                // Fallback to origin/dest segment if routePath is not loaded
                minDistance = getDistanceToSegment(clickedCoord, originCoord, destCoord);
            }

            if (minDistance <= 200) {
                onLocationSelected(e.latlng.lat, e.latlng.lng)
            } else {
                onDistanceError('จุดที่เลือกอยู่ห่างจากเส้นทางเกิน 200 เมตร')
            }
        },
    })
    return null
}

interface MapComponentProps {
    originName: string | undefined
    destinationName: string | undefined
    onPickupSelected?: (lat: number, lng: number) => void
    onDropoffSelected?: (lat: number, lng: number) => void
    selectedPickupCoord?: [number, number] | null
    selectedDropoffCoord?: [number, number] | null
    pinMode?: 'pickup' | 'dropoff' | 'none'
}

export default function MapComponent({
    originName,
    destinationName,
    onPickupSelected,
    onDropoffSelected,
    selectedPickupCoord,
    selectedDropoffCoord,
    pinMode = 'none'
}: MapComponentProps) {
    const [L, setL] = useState<any>(null)
    const [errorHeader, setErrorHeader] = useState<string | null>(null)
    const [routePath, setRoutePath] = useState<[number, number][]>([])

    // Extract station names
    const cleanName = (fullName: string | undefined) => {
        if (!fullName) return undefined

        // Handle "Province - StationName" format from UI
        if (fullName.includes(' - ')) {
            const parts = fullName.split(' - ')
            // Primary station name is usually the second part
            const stationPart = parts[1]?.trim()
            if (stationPart && STATION_COORDS[stationPart]) return stationPart

            // Fallback to first part
            const altPart = parts[0]?.trim()
            if (altPart && STATION_COORDS[altPart]) return altPart
        }

        // Handle "StationName, Province" or plain format
        const plainName = fullName.split(',')[0].trim()
        return plainName
    }

    const originStation = cleanName(originName)
    const destStation = cleanName(destinationName)

    const originCoord = originStation ? STATION_COORDS[originStation] : null
    const destCoord = destStation ? STATION_COORDS[destStation] : null

    useEffect(() => {
        import('leaflet').then((leaflet) => {
            setL(leaflet)
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            })
        })
    }, [])

    // Fetch routing path from OSRM
    useEffect(() => {
        if (originCoord && destCoord) {
            const fetchRoute = async () => {
                try {
                    const res = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${originCoord[1]},${originCoord[0]};${destCoord[1]},${destCoord[0]}?overview=full&geometries=geojson`
                    );
                    const data = await res.json();
                    if (data.routes && data.routes.length > 0) {
                        const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
                        setRoutePath(coords);
                    } else {
                        setRoutePath([originCoord, destCoord]); // Fallback
                    }
                } catch (err) {
                    console.error("Routing error:", err);
                    setRoutePath([originCoord, destCoord]); // Fallback
                }
            };
            fetchRoute();
        } else {
            setRoutePath([]);
        }
    }, [originCoord, destCoord]);

    if (!L || (!originCoord && !destCoord)) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 min-h-[300px] border-2 border-dashed border-slate-200 rounded-[2rem]">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">เลือกเส้นทางเพื่อแสดงแผนที่</span>
            </div>
        )
    }

    const handleError = (msg: string) => {
        setErrorHeader(msg)
        setTimeout(() => setErrorHeader(null), 3001)
    }

    const center: [number, number] = selectedPickupCoord || selectedDropoffCoord || originCoord || destCoord || [13.7563, 100.5018]

    return (
        <div className="w-full h-full min-h-[400px] relative rounded-[1.5rem] overflow-hidden">
            {errorHeader && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-bounce">
                    {errorHeader}
                </div>
            )}

            {pinMode !== 'none' && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-blue-600 text-white p-3 rounded-2xl text-[10px] font-bold shadow-xl border border-blue-400 animate-pulse">
                    📍 กำลังปักหมุดจุด{pinMode === 'pickup' ? 'รับ' : 'ส่ง'}พิเศษ... (คลิกบนแผนที่)
                </div>
            )}

            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {pinMode !== 'none' && (
                    <MapEvents
                        onLocationSelected={(lat, lng) => {
                            if (pinMode === 'pickup' && onPickupSelected) onPickupSelected(lat, lng)
                            if (pinMode === 'dropoff' && onDropoffSelected) onDropoffSelected(lat, lng)
                        }}
                        originCoord={originCoord}
                        destCoord={destCoord}
                        routePath={routePath}
                        onDistanceError={handleError}
                    />
                )}

                {originCoord && (
                    <Marker position={originCoord}>
                        <Popup>สถานีต้นทาง: {originStation}</Popup>
                    </Marker>
                )}

                {destCoord && (
                    <Marker position={destCoord}>
                        <Popup>สถานีปลายทาง: {destStation}</Popup>
                    </Marker>
                )}

                {selectedPickupCoord && (
                    <>
                        <Marker position={selectedPickupCoord}>
                            <Popup>จุดรับที่คุณเลือก</Popup>
                        </Marker>
                        <Circle
                            center={selectedPickupCoord}
                            pathOptions={{ fillColor: '#3b82f6', color: '#3b82f6', opacity: 0.2 }}
                            radius={200}
                        />
                    </>
                )}

                {selectedDropoffCoord && (
                    <>
                        <Marker position={selectedDropoffCoord}>
                            <Popup>จุดส่งที่คุณเลือก</Popup>
                        </Marker>
                        <Circle
                            center={selectedDropoffCoord}
                            pathOptions={{ fillColor: '#ef4444', color: '#ef4444', opacity: 0.2 }}
                            radius={200}
                        />
                    </>
                )}

                {routePath.length > 0 && (
                    <Polyline
                        positions={routePath}
                        pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.4 }}
                    />
                )}
            </MapContainer>
        </div>
    )
}
