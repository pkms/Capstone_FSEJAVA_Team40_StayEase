import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../pages/Home';
import HotelsList from '../pages/HotelsList';
import HotelDetail from '../pages/HotelDetail';
import BookingPage from '../pages/BookingPage';
import MyStays from '../pages/MyStays';
import LoginRegister from '../pages/LoginRegister';
import AdminDashboard from '../pages/AdminDashboard';
import { renderWithProviders } from './pageTestUtils';
import type { Hotel, Room } from '../types';

const { hotel, room } = vi.hoisted(() => {
  const testHotel: Hotel = {
    id: 'hotel-1', name: 'Sunset Palms', city: 'Goa', starRating: 4,
    description: 'Beachfront resort', coverImageUrl: 'https://example.com/hotel.jpg',
  };
  const testRoom: Room = {
    id: 'room-1', hotelId: testHotel.id, roomNumber: '101', roomType: 'Double',
    pricePerNight: 3500, maxOccupancy: 2, isActive: true,
  };
  return { hotel: testHotel, room: testRoom };
});

vi.mock('../api/mockApi', () => ({
  searchHotels: vi.fn().mockResolvedValue([hotel]),
  getHotelById: vi.fn().mockResolvedValue(hotel),
  getAvailableRooms: vi.fn().mockResolvedValue([room]),
  createBooking: vi.fn().mockResolvedValue({ bookingRef: 'booking-1' }),
  getBookingsForUser: vi.fn().mockResolvedValue([]),
  cancelBooking: vi.fn(),
  listUsers: vi.fn().mockResolvedValue([]),
  getAllBookings: vi.fn().mockResolvedValue([]),
  listAllHotels: vi.fn().mockResolvedValue([]),
  createHotel: vi.fn(),
  updateHotel: vi.fn(),
  deleteHotel: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

describe('page components', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('Home searches for a selected destination and date range', () => {
    const navigate = vi.fn();
    renderWithProviders(<Home navigate={navigate} />);
    fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Goa' } });
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: '2099-08-25' } });
    fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: '2099-08-28' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search Hotels' }));
    expect(navigate).toHaveBeenCalledWith('#/hotels?city=Goa&checkIn=2099-08-25&checkOut=2099-08-28');
  });

  it('HotelsList loads and displays hotels for the query city', async () => {
    renderWithProviders(<HotelsList query={new URLSearchParams('city=Goa&checkIn=2099-08-25&checkOut=2099-08-28')} navigate={vi.fn()} />);
    expect(await screen.findByRole('heading', { name: /Sunset Palms/ })).toBeTruthy();
  });

  it('HotelDetail loads the hotel and available rooms section', async () => {
    renderWithProviders(<HotelDetail hotelId={hotel.id} query={new URLSearchParams('checkIn=2099-08-25&checkOut=2099-08-28')} navigate={vi.fn()} />);
    expect(await screen.findByRole('heading', { name: /Sunset Palms/ })).toBeTruthy();
    expect(await screen.findByText('Available Rooms')).toBeTruthy();
  });

  it('BookingPage displays hotel details and confirms a booking for a logged-out user by redirecting', async () => {
    const navigate = vi.fn();
    renderWithProviders(<BookingPage query={new URLSearchParams('hotelId=hotel-1&roomId=room-1&checkIn=2099-08-25&checkOut=2099-08-28')} navigate={navigate} />);
    expect(await screen.findByText('Sunset Palms')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }));
    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(navigate.mock.calls[0][0]).toContain('#/login?redirect=');
  });

  it('MyStays redirects logged-out users to login', async () => {
    const navigate = vi.fn();
    renderWithProviders(<MyStays navigate={navigate} />);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('#/login?redirect=')));
  });

  it('LoginRegister switches between login and registration modes', () => {
    renderWithProviders(<LoginRegister navigate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /create an account/i }));
    expect(screen.getByLabelText('Name')).toBeTruthy();
  });

  it('AdminDashboard shows its hotel management sections for an admin', () => {
    const payload = btoa(JSON.stringify({ sub: 'admin@example.com' }));
    localStorage.setItem('stayease_token', `header.${payload}.signature`);
    localStorage.setItem('stayease_role', 'ADMIN');
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
    expect(screen.getByText('Create New Hotel')).toBeTruthy();
    expect(screen.queryByText('All Bookings')).toBeNull();
  });
});
