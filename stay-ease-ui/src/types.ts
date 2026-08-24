export type Role = 'GUEST' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  starRating: number;
  description?: string;
  coverImageUrl?: string;
  managerId?: string;
}

export type RoomType = 'Single' | 'Double' | 'Suite';

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  roomType: RoomType;
  pricePerNight: number;
  maxOccupancy: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  hotelId: string;
  hotelName?: string;
  hotelCity?: string;
  roomId: string;
  roomNumber?: string;
  roomType?: RoomType;
  pricePerNight?: number;
  checkInDate: string; // ISO
  checkOutDate: string; // ISO
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}
