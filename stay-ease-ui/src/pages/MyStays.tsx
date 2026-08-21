import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getBookingsForUser, cancelBooking } from '../api/mockApi';
import type { Booking } from '../types';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';

export default function MyStays({ navigate }: { navigate: (hash: string) => void }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { show } = useToast();

  useEffect(() => {
    if (!user) {
      show(strings.myStays.pleaseLogin, 'warning');
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
      setError(e.message || strings.myStays.cancelFailed);
    }
  };

  if (!user) return null;

  return (
    <div className="page my-stays card">
      <h2>{strings.myStays.title}</h2>
      {loading && <div>{strings.myStays.loading}</div>}
      {error && <div className="form-error">{error}</div>}
      <table className="stays-table">
        <thead>
          <tr><th>{strings.myStays.hotel}</th><th>{strings.myStays.room}</th><th>{strings.myStays.checkIn}</th><th>{strings.myStays.checkOut}</th><th>{strings.myStays.total}</th><th>{strings.myStays.status}</th><th></th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.hotelName ?? b.hotelId}</td>
              <td>{b.roomNumber ?? b.roomId}</td>
              <td>{b.checkInDate?.split('T')[0]}</td>
              <td>{b.checkOutDate?.split('T')[0]}</td>
              <td>₹{b.totalPrice}</td>
              <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
              <td>{b.status === 'CONFIRMED' && <button className="small-button" onClick={() => doCancel(b.id)}>{strings.myStays.cancel}</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}