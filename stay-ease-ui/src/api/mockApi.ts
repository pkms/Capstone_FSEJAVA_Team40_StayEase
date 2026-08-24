// Real StayEase backend integration.

import type { Hotel, Room, RoomType, User, Booking, Role } from '../types';
import { request, setToken, setStoredRole, setStoredUserId, clearToken, decodeToken } from './client';

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
    isActive: r.active ?? r.isActive ?? true,
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
    hotelCity: hotel.city,
    roomId: room.roomId ?? b.roomId ?? '',
    roomNumber: room.roomNumber !== undefined ? String(room.roomNumber) : (b.roomNumber !== undefined ? String(b.roomNumber) : undefined),
    roomType: room.roomType,
    pricePerNight: room.pricePerNight !== undefined ? Number(room.pricePerNight) : undefined,
    checkInDate,
    checkOutDate,
    totalPrice,
    // The backend appears to mark every successfully created booking as
    // "COMPLETED" regardless of whether the stay is in the past or future
    // (confirmed: a booking checking out 2026-08-26 came back COMPLETED on
    // 2026-08-22) — so that field can't be trusted for "past vs upcoming".
    // We only trust it for CANCELLED (an explicit action); otherwise we
    // derive completed/confirmed ourselves from the checkout date.
    status: (() => {
      const backendStatus = b.bookingStatus ?? b.status;
      if (backendStatus === 'CANCELLED') return 'CANCELLED';
      const isPast = checkOutDate ? new Date(checkOutDate) < new Date() : false;
      return isPast ? 'COMPLETED' : 'CONFIRMED';
    })(),
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
  userId: string;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await request<LoginResponse>('/api/auth/login', { method: 'POST', body: { email, password } });
  setToken(res.jwtToken);
  setStoredRole(res.role);
  setStoredUserId(res.userId);
  const claims = decodeToken(res.jwtToken);
  const sub = claims?.sub ?? email;
  return {
    id: res.userId,
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

export async function updateRoom(
  roomId: string,
  payload: { roomNumber: number; roomType: RoomType; pricePerNight: number; maxOccupancy: number }
): Promise<void> {
  // Like createRoom, the update endpoint's response is documented as a plain
  // string rather than the updated room — callers should re-fetch rooms
  // (e.g. via listRoomsForManager) after this resolves.
  await request(`/api/rooms/${encodeURIComponent(roomId)}/update`, {
    method: 'PUT',
    body: payload,
  });
}

export async function toggleRoomStatus(roomId: string, active: boolean): Promise<void> {
  await request(`/api/rooms/${encodeURIComponent(roomId)}/status`, {
    method: 'PATCH',
    query: { active },
  });
}

export async function deleteRoom(roomId: string): Promise<void> {
  await request(`/api/rooms/${encodeURIComponent(roomId)}/delete`, {
    method: 'DELETE',
  });
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
  const created = await request<any>('/api/bookings/create', {
    method: 'POST',
    body: { roomId, checkInDate: toIsoDateTime(checkIn), checkOutDate: toIsoDateTime(checkOut) },
  });

  // If the backend actually returns the created booking object (its OpenAPI
  // spec claims "string", but that's sometimes wrong/stale), use it directly
  // instead of re-fetching.
  if (created && typeof created === 'object' && created.id) {
    return mapBooking(created);
  }

  // Otherwise, re-fetch "my bookings" and try to find the one we just created.
  // Match loosely (dates first) rather than a strict roomId+status match —
  // the nested room object's field names inside BookingResponse may not be
  // exactly what we assume in mapBooking/mapRoom.
  const mine = await getBookingsForUser('');
  const byRoomAndDates = mine.find(
    (b) => b.roomId === roomId && b.checkInDate?.startsWith(checkIn) && b.checkOutDate?.startsWith(checkOut)
  );
  if (byRoomAndDates) return byRoomAndDates;

  const byDatesOnly = mine.find((b) => b.checkInDate?.startsWith(checkIn) && b.checkOutDate?.startsWith(checkOut));
  if (byDatesOnly) return byDatesOnly;

  // Last resort: the booking clearly succeeded (My Stays will show it) even
  // though we couldn't confidently identify which entry is the new one here —
  // don't block the user with an error over a display-only lookup.
  console.warn('createBooking: could not identify the new booking in /api/bookings/mine — check the roomId field name inside BookingResponse.room.');
  const mostRecent = mine[mine.length - 1];
  if (mostRecent) return mostRecent;

  throw new Error('Booking created, but could not be confirmed — check My Stays.');
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
// Manager dashboard
// ---------------------------------------------------------------------------

export async function listRoomsForManager(managerId: string): Promise<Room[]> {
  const results = await request<any[]>(`/api/rooms/${encodeURIComponent(managerId)}`);
  return (results ?? []).map((r) => mapRoom(r));
}

export async function listUpcomingBookingsForManager(days: number = 10, hotelIds?: string[]): Promise<Booking[]> {
  // This endpoint returns upcoming bookings across ALL hotels, not just this
  // manager's — there's no server-side manager filter, so we filter client-side
  // using the hotel IDs already loaded via listHotelsForManager.
  const data = await request<any[]>(`/api/bookings/${days}/upcoming`);
  const mapped = (data ?? []).map(mapBooking);
  if (!hotelIds || hotelIds.length === 0) return mapped;
  const idSet = new Set(hotelIds.map((id) => id.toLowerCase()));
  return mapped.filter((b) => idSet.has((b.hotelId || '').toLowerCase()));
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
    starRating: payload.starRating,
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
  updateRoom,
  toggleRoomStatus,
  deleteRoom,
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