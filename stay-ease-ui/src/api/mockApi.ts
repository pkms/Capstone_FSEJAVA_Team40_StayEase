// Real StayEase backend integration.

import type { Hotel, Room, RoomType, User, Booking, Role } from '../types';
import { request, setToken, setStoredRole, clearToken, decodeToken } from './client';

// ---------------------------------------------------------------------------
// Response shape adapters — the backend's field names/casing differ from the
// frontend's `types.ts` (e.g. `hotelId` vs `id`), so we normalize here.
// ---------------------------------------------------------------------------

function mapHotel(h: any): Hotel {
  return {
    id: h.hotelId ?? h.id,
    name: h.name,
    city: h.city,
    starRating: h.starRating,
    description: h.description,
    coverImageUrl: h.coverImageUrl,
    managerId: h.managerId,
  };
}

function mapRoom(r: any, fallbackHotelId?: string): Room {
  return {
    id: r.roomId,
    hotelId: r.hotelId ?? fallbackHotelId ?? '',
    roomNumber: String(r.roomNumber),
    roomType: r.roomType,
    pricePerNight: r.pricePerNight,
    maxOccupancy: r.maxOccupancy,
    description: r.description,
    imageUrl: r.imageUrl,
    isActive: r.isActive ?? true,
  };
}

function mapBooking(b: any): Booking {
  const room = b.room ?? {};
  const hotel = room.hotel ?? b.hotel ?? {};
  const checkInDate = b.checkInDate;
  const checkOutDate = b.checkOutDate;
  const nights = Math.max(
    0,
    Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
  );
  const totalPrice = room.pricePerNight !== undefined
    ? Number(room.pricePerNight) * nights
    : (b.totalPrice ?? 0);
  return {
    id: b.id,
    // Backend doesn't return a separate booking reference — reuse the id.
    bookingRef: b.id,
    userId: '', // not returned by /api/bookings/mine; backend identifies the user via the JWT instead
    hotelId: room.hotelId ?? hotel.hotelId ?? hotel.id ?? b.hotelId ?? '',
    hotelName: hotel.name ?? b.hotelName,
    roomId: room.roomId ?? b.roomId ?? '',
    roomNumber: room.roomNumber !== undefined ? String(room.roomNumber) : (b.roomNumber !== undefined ? String(b.roomNumber) : undefined),
    checkInDate,
    checkOutDate,
    totalPrice,
    status: (b.bookingStatus ?? b.status) === 'CANCELLED'
      ? 'CANCELLED'
      : (b.bookingStatus ?? b.status) === 'COMPLETED'
        ? 'COMPLETED'
        : 'CONFIRMED',
    createdAt: checkInDate,
  };
}

// <input type="date"> gives "YYYY-MM-DD"; the backend expects a full ISO date-time.
function toIsoDateTime(dateStr: string) {
  return `${dateStr}T00:00:00`;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

interface LoginResponse {
  jwtToken: string;
  role: Role;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await request<LoginResponse>('/api/auth/login', { method: 'POST', body: { email, password } });
  setToken(res.jwtToken);
  setStoredRole(res.role);
  const claims = decodeToken(res.jwtToken);
  const sub = claims?.sub ?? email;
  return {
    id: sub,
    email: sub,
    // Backend's JWT still only carries `sub` (email) — no display name yet, so we derive a placeholder.
    name: sub.split('@')[0],
    // Role now comes from the login response body.
    role: res.role,
  };
}

export async function register(email: string, password: string, name: string): Promise<User> {
  await request('/api/auth/register', { method: 'POST', body: { email, name, password } });
  // Registration doesn't return a token — log the new user in immediately after.
  const user = await login(email, password);
  // We DO know the real name here (the user just typed it), unlike on a plain login.
  return { ...user, name };
}

export function logoutLocal() {
  clearToken();
}

// ---------------------------------------------------------------------------
// Hotels (guest-facing)
// ---------------------------------------------------------------------------

// In-memory cache so getHotelById can work as long as the hotel was seen via
// searchHotels earlier in this session — see gap note below.
const hotelCache = new Map<string, Hotel>();

export async function searchHotels(city: string): Promise<Hotel[]> {
  const results = await request<any[]>('/api/hotels', { query: { city } });
  const mapped = results.map(mapHotel);
  mapped.forEach((h) => hotelCache.set(h.id, h));
  return mapped;
}

export async function getHotelById(id: string): Promise<Hotel> {
  const cached = hotelCache.get(id);
  if (cached) return cached;
  // GAP: backend has no GET /api/hotels/{id}. This only works if the hotel was
  // already loaded via searchHotels this session (e.g. came from the list page).
  // Add a single-hotel endpoint on the backend to fix direct links/refreshes.
  throw new Error('Hotel details unavailable — ask a hotel list first, or add GET /api/hotels/{id} on the backend.');
}

export async function getAvailableRooms(hotelId: string, checkInDate: string, checkOutDate: string): Promise<Room[]> {
  const data = await request<any>(`/api/hotels/${encodeURIComponent(hotelId)}/availableRooms`, {
    query: { checkInDate: toIsoDateTime(checkInDate), checkOutDate: toIsoDateTime(checkOutDate) },
  });
  const list = Array.isArray(data) ? data : (data?.rooms ?? []);
  return list.map((r: any) => mapRoom(r, hotelId));
}

export async function listHotelsForManager(managerId: string): Promise<Hotel[]> {
  const [results, managers] = await Promise.all([
    request<any[]>('/api/hotels/all'),
    listUsers('MANAGER'),
  ]);
  const manager = managers.find((candidate) =>
    candidate.id === managerId || candidate.email.toLowerCase() === managerId.toLowerCase()
  );
  const assignedManagerId = manager?.id ?? managerId;
  const mapped = results
    .map(mapHotel)
    .filter((hotel) => hotel.managerId?.toLowerCase() === assignedManagerId.toLowerCase());
  mapped.forEach((hotel) => hotelCache.set(hotel.id, hotel));
  return mapped;
}

export async function createRoom(
  hotelId: string,
  payload: { roomNumber: number; roomType: RoomType; pricePerNight: number; maxOccupancy: number }
): Promise<Room> {
  const response = await request<any>(`/api/hotels/${encodeURIComponent(hotelId)}/createRoom`, {
    method: 'POST',
    body: payload,
  });
  return mapRoom(response, hotelId);
}

// ---------------------------------------------------------------------------
// Bookings (guest-facing)
// ---------------------------------------------------------------------------

export async function createBooking(
  _userId: string,
  _hotelId: string,
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<Booking> {
  // Backend derives the user from the JWT and doesn't return the created booking
  // object (its OpenAPI spec marks the response as a plain string) — so after
  // creating, we re-fetch "my bookings" and pick the newest match for this room.
  await request('/api/bookings/create', {
    method: 'POST',
    body: { roomId, checkInDate: toIsoDateTime(checkIn), checkOutDate: toIsoDateTime(checkOut) },
  });
  const mine = await getBookingsForUser('');
  const match = mine.find((b) => b.roomId === roomId && b.status === 'CONFIRMED');
  if (!match) throw new Error('Booking created, but could not be confirmed — check My Stays.');
  return match;
}

export async function getBookingsForUser(_userId: string): Promise<Booking[]> {
  const data = await request<any[]>('/api/bookings/mine');
  return data.map(mapBooking);
}

export async function cancelBooking(bookingId: string, _userId: string): Promise<Booking> {
  await request(`/api/bookings/${bookingId}/cancel`, { method: 'PUT' });
  const mine = await getBookingsForUser('');
  const updated = mine.find((b) => b.id === bookingId);
  if (!updated) throw new Error('Booking cancelled, but could not refresh its status.');
  return updated;
}

// ---------------------------------------------------------------------------
// Manager dashboard — GAP: no backend endpoints exist for these yet.
// Stubbed to return empty arrays (instead of throwing) so the dashboard page
// still renders; add the endpoints on the backend to make this real.
// ---------------------------------------------------------------------------

export async function listRoomsForManager(_managerId: string): Promise<Room[]> {
  console.warn('listRoomsForManager: no backend endpoint yet — returning empty list.');
  return [];
}

export async function listUpcomingBookingsForManager(_managerId: string): Promise<Booking[]> {
  console.warn('listUpcomingBookingsForManager: no backend endpoint yet — returning empty list.');
  return [];
}

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

interface BackendUser {
  email: string;
  grantedAuthority?: { authority?: string };
  id: string;
  name: string;
}

export async function listUsers(role?: Role): Promise<User[]> {
  const path = role ? `/api/users/${encodeURIComponent(role)}` : '/api/users';
  const users = await request<BackendUser[]>(path);
  return users.map((backendUser) => ({
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: role ?? (backendUser.grantedAuthority?.authority?.replace(/^ROLE_/, '') as Role) ?? 'GUEST',
  }));
}

export async function getAllBookings(): Promise<Booking[]> {
  console.warn('getAllBookings: no backend endpoint yet — returning empty list.');
  return [];
}

export async function listAllHotels(): Promise<Hotel[]> {
  try {
    // GET /api/hotels requires a non-empty `city` per its spec — an empty string
    // may be rejected. If so, this falls back to an empty list; ask backend for
    // a proper "list all hotels" (no city filter) endpoint for Admin use.
    const results = await request<any[]>('/api/hotels/all');
    return results.map(mapHotel);
  } catch {
    console.warn('listAllHotels: backend requires a city filter — Admin hotel list may be incomplete.');
    return [];
  }
}

export async function createHotel(payload: Partial<Hotel>): Promise<Hotel> {
  const body = {
    name: payload.name,
    city: payload.city,
    starRating: payload.starRating,
    description: payload.description,
    coverImageUrl: payload.coverImageUrl,
    managerId: payload.managerId,
  };
  // Response is a plain string, not the created hotel — AdminDashboard already
  // re-fetches the hotel list right after calling this, so that's fine.
  await request('/api/hotels/create', { method: 'POST', body });
  return body as unknown as Hotel;
}

export async function updateHotel(id: string, payload: Partial<Hotel>): Promise<Hotel> {
  const body = {
    name: payload.name,
    city: payload.city,
    description: payload.description,
    coverImageUrl: payload.coverImageUrl,
    managerId: payload.managerId,
  };
  await request(`/api/hotels/${id}/update`, { method: 'PUT', body });
  return { id, ...body } as unknown as Hotel;
}

export async function deleteHotel(id: string): Promise<boolean> {
  await request(`/api/hotels/${id}/delete`, { method: 'DELETE' });
  return true;
}

// minimal export for UI
export default {
  register,
  login,
  searchHotels,
  getHotelById,
  getAvailableRooms,
  listHotelsForManager,
  createRoom,
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