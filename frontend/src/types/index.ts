export type RideType = 'SHORT_DISTANCE' | 'LONG_DISTANCE';
export type RideStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isStudent: boolean;
  university?: string;
  avatar?: string;
  bio?: string;
  role: string;
  createdAt: string;
  _count?: {
    rides: number;
    bookings: number;
  };
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isStudent: boolean;
  university?: string;
  avatar?: string;
  bio?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driver: Driver;
  fromCity: string;
  toCity: string;
  fromAddress?: string;
  toAddress?: string;
  departureDate: string;
  seats: number;
  seatsLeft: number;
  pricePerSeat: number;
  rideType: RideType;
  description?: string;
  status: RideStatus;
  createdAt: string;
  bookings?: Booking[];
  _count?: { bookings: number };
}

export interface Booking {
  id: string;
  rideId: string;
  ride: Ride;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
    isStudent: boolean;
  };
  seats: number;
  status: BookingStatus;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  rideType?: RideType | '';
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}
