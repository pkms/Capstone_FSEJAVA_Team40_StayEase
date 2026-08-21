import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createRoom, listHotelsForManager, listRoomsForManager, listUpcomingBookingsForManager } from '../api/mockApi';
import type { Hotel, Room, RoomType, Booking } from '../types';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [roomForm, setRoomForm] = useState({ roomNumber: '', roomType: 'Double' as RoomType, pricePerNight: '', maxOccupancy: '' });
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
    listHotelsForManager(user.id).then((managerHotels) => {
      setHotels(managerHotels);
      setSelectedHotelId(managerHotels[0]?.id ?? '');
    });
    listRoomsForManager(user.id).then((r) => setRooms(r));
    listUpcomingBookingsForManager(user.id).then((b) => setBookings(b));
  }, [user]);

  if (!user) return null;

  const onCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomNumber = Number(roomForm.roomNumber);
    const pricePerNight = Number(roomForm.pricePerNight);
    const maxOccupancy = Number(roomForm.maxOccupancy);
    if (!selectedHotelId) return show(strings.manager.hotelRequired, 'error');
    if (!Number.isInteger(roomNumber) || roomNumber <= 0) return show(strings.manager.roomNumberRequired, 'error');
    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) return show(strings.manager.priceRequired, 'error');
    if (!Number.isInteger(maxOccupancy) || maxOccupancy <= 0) return show(strings.manager.occupancyRequired, 'error');
    try {
      const createdRoom = await createRoom(selectedHotelId, { roomNumber, roomType: roomForm.roomType, pricePerNight, maxOccupancy });
      setRooms((currentRooms) => [...currentRooms, createdRoom]);
      setRoomForm({ roomNumber: '', roomType: 'Double', pricePerNight: '', maxOccupancy: '' });
      show(strings.manager.roomCreated, 'success');
    } catch (err: any) {
      show(err?.message || strings.manager.roomCreateFailed, 'error');
    }
  };

  return (
    <div className="page manager card">
      <h2>{strings.manager.title}</h2>
      <section className="hotel-form card">
        <h3>{strings.manager.createRoom}</h3>
        <form onSubmit={onCreateRoom}>
          <div className="form-row">
            <label>{strings.manager.hotels}</label>
            <select value={selectedHotelId} onChange={(e) => setSelectedHotelId(e.target.value)} required>
              <option value="">{strings.manager.selectHotel}</option>
              {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name} ({hotel.city})</option>)}
            </select>
            {hotels.length === 0 && <span className="muted">{strings.manager.noHotels}</span>}
          </div>
          <div className="form-row">
            <label>{strings.manager.roomNumber}</label>
            <input type="number" min={1} step={1} value={roomForm.roomNumber} onChange={(e) => setRoomForm((form) => ({ ...form, roomNumber: e.target.value }))} required />
          </div>
          <div className="form-row">
            <label>{strings.manager.roomType}</label>
            <select value={roomForm.roomType} onChange={(e) => setRoomForm((form) => ({ ...form, roomType: e.target.value as RoomType }))}>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>
          <div className="form-row">
            <label>{strings.manager.pricePerNight}</label>
            <input type="number" min={0.01} step="0.01" value={roomForm.pricePerNight} onChange={(e) => setRoomForm((form) => ({ ...form, pricePerNight: e.target.value }))} required />
          </div>
          <div className="form-row">
            <label>{strings.manager.maxOccupancy}</label>
            <input type="number" min={1} step={1} value={roomForm.maxOccupancy} onChange={(e) => setRoomForm((form) => ({ ...form, maxOccupancy: e.target.value }))} required />
          </div>
          <button type="submit" className="primary-button">{strings.manager.createRoomAction}</button>
        </form>
      </section>
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
