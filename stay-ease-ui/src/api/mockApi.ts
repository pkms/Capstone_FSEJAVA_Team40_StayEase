import type { Hotel, Room, User, Booking } from '../types';
function genId() { return 'id-' + Math.random().toString(36).slice(2, 9); }

// Simple in-memory seed data inspired by the PDF
const users: User[] = [
  { id: 'u-admin', email: 'admin@stayease.com', name: 'Admin', role: 'ADMIN' },
  { id: 'u-mgr1', email: 'mgr1@stayease.com', name: 'Hotel Mgr', role: 'MANAGER' },
  { id: 'u-guest1', email: 'guest1@stayease.com', name: 'Rohit Verma', role: 'GUEST' },
];

const hotels: Hotel[] = [
  {
    id: 'h-sunset',
    name: 'Sunset Palms',
    city: 'Goa',
    starRating: 4,
    description: 'Beachfront resort with pool',
    coverImageUrl: 'https://picsum.photos/seed/hotel1/800/360',
    managerId: 'u-mgr1',
  },
  {
    id: 'h-city',
    name: 'City Inn',
    city: 'Goa',
    starRating: 3,
    description: 'Budget-friendly city centre hotel',
    coverImageUrl: 'https://picsum.photos/seed/hotel2/800/360',
    managerId: 'u-mgr1',
  },
];

const rooms: Room[] = [
  { id: 'r-101-s', hotelId: 'h-sunset', roomNumber: '101', roomType: 'Double', pricePerNight: 3500, maxOccupancy: 2, isActive: true },
  { id: 'r-201-s', hotelId: 'h-sunset', roomNumber: '201', roomType: 'Suite', pricePerNight: 7000, maxOccupancy: 3, isActive: true },
  { id: 'r-101-c', hotelId: 'h-city', roomNumber: '101', roomType: 'Single', pricePerNight: 1500, maxOccupancy: 1, isActive: true },
];

let bookings: Booking[] = [];

function delay<T>(ms = 300, value?: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value as T), ms));
}

export async function register(email: string, _password: string, name: string) {
  // password ignored for mock
  const exists = users.find((u) => u.email === email.toLowerCase());
  if (exists) throw new Error('Email already registered');
  const user: User = { id: genId(), email: email.toLowerCase(), name, role: 'GUEST' };
  users.push(user);
  return delay(200, user);
}

export async function login(email: string, _password: string) {
  // password ignored for mock
  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) throw new Error('Invalid credentials');
  return delay(200, user);
}

export async function searchHotels(city: string) {
  const results = hotels.filter((h) => h.city.toLowerCase().includes(city.trim().toLowerCase()));
  return delay(200, results);
}

export async function getHotelById(id: string) {
  const h = hotels.find((x) => x.id === id);
  if (!h) throw new Error('Hotel not found');
  return delay(150, h);
}

// Returns rooms for hotel that are active and not booked for overlapping dates
export async function getAvailableRooms(hotelId: string, checkIn: string, checkOut: string) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const roomList = rooms.filter((r) => r.hotelId === hotelId && r.isActive);

  const available = roomList.filter((r) => {
    const overlapping = bookings.find((b) => b.roomId === r.id && b.status !== 'CANCELLED' && (new Date(b.checkInDate) < checkOutDate) && (new Date(b.checkOutDate) > checkInDate));
    return !overlapping;
  });
  return delay(200, available);
}

export async function createBooking(userId: string, hotelId: string, roomId: string, checkIn: string, checkOut: string) {
  const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  if (nights <= 0) throw new Error('Check-out must be after check-in');
  const room = rooms.find((r) => r.id === roomId);
  if (!room) throw new Error('Room not found');
  // check availability again
  const overlapping = bookings.find((b) => b.roomId === room.id && b.status !== 'CANCELLED' && (new Date(b.checkInDate) < new Date(checkOut)) && (new Date(b.checkOutDate) > new Date(checkIn)));
  if (overlapping) throw new Error('Room not available for selected dates');

  const totalPrice = nights * room.pricePerNight;
  const booking = {
    id: genId(),
    bookingRef: 'BK-' + Math.random().toString(36).slice(2, 9).toUpperCase(),
    userId,
    hotelId,
    roomId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalPrice,
    status: 'CONFIRMED' as const,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  return delay(300, booking);
}

export async function getBookingsForUser(userId: string) {
  const b = bookings.filter((bk) => bk.userId === userId);
  return delay(150, b);
}

export async function cancelBooking(bookingId: string, userId: string) {
  const idx = bookings.findIndex((b) => b.id === bookingId && b.userId === userId);
  if (idx === -1) throw new Error('Booking not found');
  bookings[idx] = { ...bookings[idx], status: 'CANCELLED' };
  return delay(150, bookings[idx]);
}

export async function listRoomsForManager(managerId: string) {
  const managedHotels = hotels.filter((h) => h.managerId === managerId).map((h) => h.id);
  const myRooms = rooms.filter((r) => managedHotels.includes(r.hotelId));
  return delay(150, myRooms);
}

export async function listUpcomingBookingsForManager(managerId: string) {
  const managedHotelIds = hotels.filter((h) => h.managerId === managerId).map((h) => h.id);
  const now = new Date();
  const upcoming = bookings.filter((b) => managedHotelIds.includes(b.hotelId) && new Date(b.checkOutDate) >= now && b.status !== 'CANCELLED');
  return delay(150, upcoming);
}

export async function listUsers() {
  return delay(150, users.slice());
}

export async function getAllBookings() {
  return delay(150, bookings.slice());
}

export async function listAllHotels() {
  return delay(150, hotels.map((h) => ({ ...h })));
}

export async function createHotel(payload: Partial<Hotel>) {
  if (!payload.name || !payload.city) throw new Error('Name and city are required');
  const h: Hotel = {
    id: genId(),
    name: payload.name,
    city: payload.city,
    starRating: payload.starRating ?? 3,
    description: payload.description,
    coverImageUrl: payload.coverImageUrl,
    managerId: payload.managerId,
  };
  hotels.push(h);
  return delay(150, h);
}

export async function updateHotel(id: string, payload: Partial<Hotel>) {
  const idx = hotels.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error('Hotel not found');
  hotels[idx] = { ...hotels[idx], ...payload } as Hotel;
  return delay(150, hotels[idx]);
}

export async function deleteHotel(id: string) {
  const idx = hotels.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error('Hotel not found');
  // also remove rooms for that hotel
  for (let i = rooms.length - 1; i >= 0; i--) {
    if (rooms[i].hotelId === id) rooms.splice(i, 1);
  }
  hotels.splice(idx, 1);
  return delay(150, true);
}

// minimal export for UI
export default {
  register,
  login,
  searchHotels,
  getHotelById,
  getAvailableRooms,
  createBooking,
  getBookingsForUser,
  cancelBooking,
  listRoomsForManager,
  listUpcomingBookingsForManager,
  listUsers,
  getAllBookings,
  listAllHotels,
  createHotel,
  updateHotel,
  deleteHotel,
};
