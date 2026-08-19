import { useEffect, useState } from 'react';
import { createBooking, getHotelById } from '../api/mockApi';
import { useAuth } from '../contexts/AuthContext';
import type { Hotel } from '../types';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';

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
      show(strings.booking.pleaseLogin, 'warning');
      return navigate(`#/login?redirect=${encodeURIComponent(window.location.hash)}`);
    }
    setLoading(true);
    try {
      const b = await createBooking(user.id, hotelId, roomId, checkIn, checkOut);
      setBookingRef(b.bookingRef);
      show(strings.booking.bookingSuccess, 'success');
    } catch (e: any) {
      setError(e.message || strings.booking.bookingFailed);
      show(e.message || strings.booking.bookingFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) return <div>{strings.booking.loadingHotel}</div>;

  return (
    <div className="page booking card">
      <h2>{strings.booking.title}</h2>
      <div>
        <div><strong>{strings.booking.hotel}</strong> {hotel.name}</div>
        <div><strong>{strings.booking.checkIn}</strong> {checkIn}</div>
        <div><strong>{strings.booking.checkOut}</strong> {checkOut}</div>
      </div>

      {bookingRef ? (
        <div className="success">
          <h3>{strings.booking.bookingConfirmed}</h3>
          <div>{strings.booking.bookingId} <strong>{bookingRef}</strong></div>
          <div><button className="primary-button" onClick={() => navigate('#/mystays')}>{strings.booking.viewMyStays}</button></div>
        </div>
      ) : (
        <div className="actions">
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" onClick={confirm} disabled={loading}>{loading ? strings.booking.bookingLoading : strings.booking.confirmBooking}</button>
        </div>
      )}
    </div>
  );
}
