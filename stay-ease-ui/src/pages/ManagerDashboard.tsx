import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listRoomsForManager, listUpcomingBookingsForManager } from '../api/mockApi';
import type { Room, Booking } from '../types';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { show } = useToast();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'MANAGER') {
      show(strings.manager.accessDenied, 'error');
      // redirect to home
      window.location.hash = '#/';
      return;
    }
    listRoomsForManager(user.id).then((r) => setRooms(r));
    listUpcomingBookingsForManager(user.id).then((b) => setBookings(b));
  }, [user]);

  if (!user) return null;

  return (
    <div className="page manager card">
      <h2>{strings.manager.title}</h2>
      <section>
        <h3>{strings.manager.myRooms}</h3>
        <table>
          <thead><tr><th>{strings.manager.number}</th><th>{strings.manager.type}</th><th>{strings.manager.price}</th><th>{strings.manager.active}</th></tr></thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}><td>{r.roomNumber}</td><td>{r.roomType}</td><td>₹{r.pricePerNight}</td><td>{r.isActive ? strings.manager.yes : strings.manager.no}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>{strings.manager.upcomingBookings}</h3>
        <table>
          <thead><tr><th>{strings.manager.booking}</th><th>{strings.manager.room}</th><th>{strings.manager.checkIn}</th><th>{strings.manager.checkOut}</th></tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}><td>{b.bookingRef}</td><td>{b.roomId}</td><td>{b.checkInDate}</td><td>{b.checkOutDate}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
