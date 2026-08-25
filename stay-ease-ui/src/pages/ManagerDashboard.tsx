import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createRoom, deleteRoom, listHotelsForManager, listRoomsForManager, listUpcomingBookingsForManager, toggleRoomStatus, updateRoom } from '../api/mockApi';
import type { Hotel, Room, RoomType, Booking } from '../types';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';

const UPCOMING_BOOKINGS_DAYS = 10;

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [roomFilterHotelId, setRoomFilterHotelId] = useState('');
  const [roomForm, setRoomForm] = useState({ roomNumber: '', roomType: 'Double' as RoomType, pricePerNight: '', maxOccupancy: '' });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyRoomId, setBusyRoomId] = useState<string | null>(null);
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
      setRoomFilterHotelId(managerHotels[0]?.id ?? '');
      const hotelIds = managerHotels.map((h) => h.id);
      listUpcomingBookingsForManager(UPCOMING_BOOKINGS_DAYS, hotelIds).then((b) => setBookings(b));
    });
    listRoomsForManager(user.id).then((r) => setRooms(r));
  }, [user]);

  if (!user) return null;

  const resetRoomForm = () => {
    setEditingRoom(null);
    setRoomForm({ roomNumber: '', roomType: 'Double', pricePerNight: '', maxOccupancy: '' });
  };

  const onEditRoom = (room: Room) => {
    setConfirmDeleteId(null);
    setEditingRoom(room);
    setSelectedHotelId(room.hotelId);
    setRoomForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: String(room.pricePerNight),
      maxOccupancy: String(room.maxOccupancy),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomNumber = Number(roomForm.roomNumber);
    const pricePerNight = Number(roomForm.pricePerNight);
    const maxOccupancy = Number(roomForm.maxOccupancy);
    if (!selectedHotelId) return show(strings.manager.hotelRequired, 'error');
    if (!Number.isInteger(roomNumber) || roomNumber <= 0) return show(strings.manager.roomNumberRequired, 'error');
    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) return show(strings.manager.priceRequired, 'error');
    if (!Number.isInteger(maxOccupancy) || maxOccupancy <= 0) return show(strings.manager.occupancyRequired, 'error');
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, { roomNumber: Number(editingRoom.roomNumber), roomType: roomForm.roomType, pricePerNight, maxOccupancy });
        show(strings.manager.roomUpdated, 'success');
      } else {
        // The create endpoint doesn't reliably return the created room object
        // (it can come back as a plain string) — so instead of trusting its
        // response, just re-fetch this manager's rooms from the server after.
        await createRoom(selectedHotelId, { roomNumber, roomType: roomForm.roomType, pricePerNight, maxOccupancy });
        show(strings.manager.roomCreated, 'success');
      }
      const refreshed = await listRoomsForManager(user.id);
      setRooms(refreshed);
      resetRoomForm();
    } catch (err: any) {
      show(err?.message || (editingRoom ? strings.manager.roomUpdateFailed : strings.manager.roomCreateFailed), 'error');
    }
  };

  const refreshRooms = async () => {
    const refreshed = await listRoomsForManager(user.id);
    setRooms(refreshed);
  };

  const onToggleActive = async (room: Room) => {
    setBusyRoomId(room.id);
    try {
      await toggleRoomStatus(room.id, !room.isActive);
      await refreshRooms();
    } catch (err: any) {
      show(err?.message || strings.manager.statusUpdateFailed, 'error');
    } finally {
      setBusyRoomId(null);
    }
  };

  const onDeleteClick = (room: Room) => {
    setConfirmDeleteId(room.id);
  };

  const onCancelDelete = () => setConfirmDeleteId(null);

  const onConfirmDelete = async (room: Room) => {
    setBusyRoomId(room.id);
    try {
      await deleteRoom(room.id);
      await refreshRooms();
      setConfirmDeleteId(null);
      if (editingRoom?.id === room.id) resetRoomForm();
      show(strings.manager.roomDeleted, 'success');
    } catch (err: any) {
      show(err?.message || strings.manager.roomDeleteFailed, 'error');
    } finally {
      setBusyRoomId(null);
    }
  };

  const selectedHotelRooms = rooms.filter((room) => room.hotelId === roomFilterHotelId);

  return (
    <div className="page manager card">
      <h2>{strings.manager.title}</h2>
      <section className="hotel-form card">
        <h3>{editingRoom ? `${strings.manager.editRoomTitle}${editingRoom.roomNumber}` : strings.manager.createRoom}</h3>
        <form onSubmit={onSubmitRoom}>
          <div className="form-row">
            <label>{strings.manager.hotels}</label>
            <select value={selectedHotelId} onChange={(e) => setSelectedHotelId(e.target.value)} required disabled={!!editingRoom}>
              <option value="">{strings.manager.selectHotel}</option>
              {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name} ({hotel.city})</option>)}
            </select>
            {hotels.length === 0 && <span className="muted">{strings.manager.noHotels}</span>}
          </div>
          <div className="form-row">
            <label>{strings.manager.roomNumber}</label>
            <input
              type="number"
              min={1}
              step={1}
              value={roomForm.roomNumber}
              onChange={(e) => setRoomForm((form) => ({ ...form, roomNumber: e.target.value }))}
              required
              disabled={!!editingRoom}
            />
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
          <div className="form-row">
            <button type="submit" className="primary-button">{editingRoom ? strings.manager.saveRoom : strings.manager.createRoomAction}</button>
            {editingRoom && <button type="button" className="small-button" onClick={resetRoomForm}>{strings.manager.cancelEdit}</button>}
          </div>
        </form>
      </section>
      <section>
        <h3>{strings.manager.availableRooms}</h3>
        <div className="form-row">
          <label>{strings.manager.hotels}</label>
          <select value={roomFilterHotelId} onChange={(e) => setRoomFilterHotelId(e.target.value)} required>
            <option value="">{strings.manager.selectHotel}</option>
            {hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name} ({hotel.city})</option>)}
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>{strings.manager.number}</th>
              <th>{strings.manager.type}</th>
              <th>{strings.manager.price}</th>
              <th>{strings.manager.maxOccupancyShort}</th>
              <th>{strings.manager.active}</th>
              <th>{strings.manager.actions}</th>
            </tr>
          </thead>
          <tbody>
            {selectedHotelRooms.map((r) => {
              const isConfirmingDelete = confirmDeleteId === r.id;
              const isBusy = busyRoomId === r.id;
              return (
                <tr key={r.id}>
                  <td>{r.roomNumber}</td>
                  <td>{r.roomType}</td>
                  <td>₹{r.pricePerNight}</td>
                  <td>{r.maxOccupancy}</td>
                  <td>
                    <button
                      type="button"
                      className={`status-toggle${r.isActive ? ' is-active' : ''}`}
                      aria-label={r.isActive ? 'Deactivate room' : 'Activate room'}
                      aria-pressed={r.isActive}
                      disabled={isBusy}
                      onClick={() => onToggleActive(r)}
                    >
                      <span className="status-toggle-thumb" />
                    </button>
                  </td>
                  <td>
                    {isConfirmingDelete ? (
                      <>
                        <span className="muted">{strings.manager.confirmDeleteRoom}</span>{' '}
                        <button type="button" className="danger-button" disabled={isBusy} onClick={() => onConfirmDelete(r)}>{strings.manager.confirmYes}</button>{' '}
                        <button type="button" disabled={isBusy} onClick={onCancelDelete}>{strings.manager.confirmNo}</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="small-button" disabled={isBusy} onClick={() => onEditRoom(r)}>{strings.manager.editRoom}</button>{' '}
                        <button type="button" className="small-button danger" disabled={isBusy} onClick={() => onDeleteClick(r)}>{strings.manager.deleteRoom}</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h3>{strings.manager.upcomingBookings} <span className="muted">(next {UPCOMING_BOOKINGS_DAYS} days)</span></h3>
        {bookings.length === 0 && <div className="muted">No upcoming bookings in this window.</div>}
        {bookings.length > 0 && (
          <table>
            <thead><tr><th>{strings.manager.booking}</th><th>{strings.manager.hotel}</th><th>{strings.manager.city}</th><th>{strings.manager.room}</th><th>{strings.manager.roomType}</th><th>{strings.manager.pricePerNight}</th><th>{strings.manager.checkIn}</th><th>{strings.manager.checkOut}</th><th>{strings.manager.status}</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.bookingRef}</td>
                  <td>{b.hotelName ?? '-'}</td>
                  <td>{b.hotelCity ?? '-'}</td>
                  <td>{b.roomNumber ?? '-'}</td>
                  <td>{b.roomType ?? '-'}</td>
                  <td>{b.pricePerNight !== undefined ? `₹${b.pricePerNight}` : '-'}</td>
                  <td>{b.checkInDate?.split('T')[0]}</td>
                  <td>{b.checkOutDate?.split('T')[0]}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}