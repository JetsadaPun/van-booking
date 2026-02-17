
export type Role = 'PASSENGER' | 'DRIVER' | 'ADMIN' | null;

export interface User {
    id: number;
    username: string;
    fullName: string;
    role: Role;
    phoneNumber?: string;
    email?: string;
    avatar?: string;
}

export interface Station {
    id: number;
    province: string;
    stationName: string;
    isMainHub: boolean;
}

export interface Route {
    id: number;
    originStation: Station;
    destinationStation: Station;
    basePrice: number;
    estimatedDuration: number;
    isActive: boolean;
}

export interface Vehicle {
    id: number;
    plateNumber: string;
    model: string;
    capacity: number;
}

export interface Schedule {
    id: number;
    route: Route;
    driver: User;
    vehicle: Vehicle;
    departureTime: string;
    status: 'AVAILABLE' | 'FULL' | 'CANCELLED';
}

export interface Booking {
    id?: number;
    user?: User;
    schedule: Schedule;
    seatNumber: number;
    pickupPoint: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffPoint?: string;
    dropoffLat?: number;
    dropoffLng?: number;
    contactPhone?: string;
    remark?: string;
    status: string;
    totalPrice: number;
    createdAt?: string;
}
