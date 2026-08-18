import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listRoomsForManager, listUpcomingBookingsForManager } from '../api/mockApi';
import type { Room, Booking } from '../types';
import { useToast } from '../contexts/ToastContext';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { show } = useToast();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'MANAGER') {
      show('Access denied: manager only', 'error');
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
      <h2>Manager Dashboard</h2>
      <section>
        <h3>My Rooms</h3>
        <table>
          <thead><tr><th>Number</th><th>Type</th><th>Price</th><th>Active</th></tr></thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}><td>{r.roomNumber}</td><td>{r.roomType}</td><td>₹{r.pricePerNight}</td><td>{r.isActive ? 'Yes' : 'No'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Upcoming Bookings</h3>
        <table>
          <thead><tr><th>Booking</th><th>Room</th><th>Check-in</th><th>Check-out</th></tr></thead>
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
