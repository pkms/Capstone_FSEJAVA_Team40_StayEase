import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBookingsForUser, cancelBooking } from '../api/mockApi';
import type { Booking } from '../types';
import { useToast } from '../contexts/ToastContext';

export default function MyStays({ navigate }: { navigate: (hash: string) => void }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { show } = useToast();

  useEffect(() => {
    if (!user) {
      show('Please login to view your stays', 'warning');
      // include current hash as redirect so user returns after login
      return navigate(`#/login?redirect=${encodeURIComponent(window.location.hash)}`);
    }
    setLoading(true);
    getBookingsForUser(user!.id).then((b) => setBookings(b)).finally(() => setLoading(false));
  }, [user]);

  const doCancel = async (id: string) => {
    if (!user) return;
    try {
      await cancelBooking(id, user.id);
      setBookings((s) => s.map((bk) => (bk.id === id ? { ...bk, status: 'CANCELLED' } : bk)));
    } catch (e: any) {
      setError(e.message || 'Cancel failed');
    }
  };

  if (!user) return null;

  return (
    <div className="page my-stays card">
      <h2>My Stays</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="form-error">{error}</div>}
      <table className="stays-table">
        <thead>
          <tr><th>Hotel</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.hotelId}</td>
              <td>{b.roomId}</td>
              <td>{b.checkInDate}</td>
              <td>{b.checkOutDate}</td>
              <td>₹{b.totalPrice}</td>
              <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
              <td>{b.status !== 'CANCELLED' && <button className="small-button" onClick={() => doCancel(b.id)}>Cancel</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}