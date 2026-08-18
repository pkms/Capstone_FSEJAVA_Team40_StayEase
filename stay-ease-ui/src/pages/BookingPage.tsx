import React, { useEffect, useState } from 'react';
import { createBooking, getHotelById } from '../api/mockApi';
import { useAuth } from '../contexts/AuthContext';
import type { Hotel } from '../types';
import { useToast } from '../contexts/ToastContext';

export default function BookingPage({ query, navigate }: { query: URLSearchParams; navigate: (hash: string) => void }) {
  const { user } = useAuth();
  const hotelId = query.get('hotelId') || '';
  const roomId = query.get('roomId') || '';
  const checkIn = query.get('checkIn') || '';
  const checkOut = query.get('checkOut') || '';

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { show } = useToast();

  useEffect(() => {
    if (!hotelId) return;
    getHotelById(hotelId).then((h) => setHotel(h));
  }, [hotelId]);

  const confirm = async () => {
    setError('');
    if (!user) {
      show('Please login to confirm booking', 'warning');
      return navigate(`#/login?redirect=${encodeURIComponent(window.location.hash)}`);
    }
    setLoading(true);
    try {
      const b = await createBooking(user.id, hotelId, roomId, checkIn, checkOut);
      setBookingRef(b.bookingRef);
      show('Booking confirmed', 'success');
    } catch (e: any) {
      setError(e.message || 'Booking failed');
      show(e.message || 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) return <div>Loading hotel…</div>;

  return (
    <div className="page booking card">
      <h2>Confirm Booking</h2>
      <div>
        <div><strong>Hotel:</strong> {hotel.name}</div>
        <div><strong>Check-in:</strong> {checkIn}</div>
        <div><strong>Check-out:</strong> {checkOut}</div>
      </div>

      {bookingRef ? (
        <div className="success">
          <h3>Booking Confirmed</h3>
          <div>Booking ID: <strong>{bookingRef}</strong></div>
          <div><button className="primary-button" onClick={() => navigate('#/mystays')}>View My Stays</button></div>
        </div>
      ) : (
        <div className="actions">
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" onClick={confirm} disabled={loading}>{loading ? 'Booking…' : 'Confirm Booking'}</button>
        </div>
      )}
    </div>
  );
}
