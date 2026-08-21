import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listUsers, getAllBookings, listAllHotels, createHotel, updateHotel, deleteHotel } from '../api/mockApi';
import type { User, Booking, Hotel } from '../types';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [form, setForm] = useState({ name: '', city: '', starRating: 3, description: '', coverImageUrl: '', managerId: '' });
  const { show } = useToast();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMIN') {
      show(strings.admin.accessDenied, 'error');
      window.location.hash = '#/';
      return;
    }
    listUsers('MANAGER').then((u) => setUsers(u));
    getAllBookings().then((b) => setBookings(b));
    listAllHotels().then((h) => setHotels(h));
  }, [user]);

  if (!user) return null;

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', city: '', starRating: 3, description: '', coverImageUrl: '', managerId: '' });
  };

  const onEdit = (h: Hotel) => {
    setEditing(h);
    setForm({ name: h.name, city: h.city, starRating: h.starRating, description: h.description ?? '', coverImageUrl: h.coverImageUrl ?? '', managerId: h.managerId ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (h: Hotel) => {
    if (!confirm(strings.admin.deleteHotelConfirm.replace('{name}', h.name))) return;
    try {
      await deleteHotel(h.id);
      show(strings.admin.hotelDeleted, 'info');
      const updated = await listAllHotels();
      setHotels(updated);
    } catch (err: any) {
      show(err?.message || strings.admin.deleteFailed, 'error');
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) { show(strings.admin.nameAndCityRequired, 'error'); return; }
    try {
      if (editing) {
        await updateHotel(editing.id, { name: form.name, city: form.city, starRating: Number(form.starRating), description: form.description, coverImageUrl: form.coverImageUrl, managerId: form.managerId || undefined });
        show(strings.admin.hotelUpdated, 'success');
      } else {
        await createHotel({ name: form.name, city: form.city, starRating: Number(form.starRating), description: form.description, coverImageUrl: form.coverImageUrl, managerId: form.managerId || undefined });
        show(strings.admin.hotelCreated, 'success');
      }
      const updated = await listAllHotels();
      setHotels(updated);
      resetForm();
    } catch (err: any) {
      show(err?.message || strings.admin.saveFailed, 'error');
    }
  };

  return (
    <div className="page admin card">
      <h2>{strings.admin.title}</h2>

      <section className="hotel-form card">
        <h3>{editing ? `${strings.admin.editHotel}${editing.name}` : strings.admin.createHotel}</h3>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>{strings.admin.hotelName}</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>{strings.admin.city}</label>
            <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>{strings.admin.starRating}</label>
            <input type="number" min={1} max={5} value={String(form.starRating)} onChange={(e) => setForm((f) => ({ ...f, starRating: Number(e.target.value) }))} />
          </div>
          <div className="form-row">
            <label>{strings.admin.manager}</label>
            <select value={form.managerId} onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))}>
              <option value="">{strings.admin.noManager}</option>
              {users.filter((u) => u.role === 'MANAGER').map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>{strings.admin.coverImageUrl}</label>
            <input value={form.coverImageUrl} onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>{strings.admin.description}</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <button type="submit" className="primary-button">{editing ? strings.admin.saveChanges : strings.admin.createHotelAction}</button>
            {editing && <button type="button" className="small-button" onClick={resetForm}>{strings.admin.cancel}</button>}
          </div>
        </form>
      </section>

      <section>
        <h3>{strings.admin.hotels}</h3>
        <table>
          <thead>
            <tr><th>{strings.admin.name}</th><th>{strings.admin.city}</th><th>{strings.admin.starRating}</th><th>{strings.admin.manager}</th><th></th></tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.city}</td>
                <td>{h.starRating}</td>
                <td>{(users.find((u) => u.id === h.managerId)?.name) ?? strings.admin.none}</td>
                <td>
                  <button className="small-button" onClick={() => onEdit(h)}>{strings.admin.edit}</button>
                  <button className="small-button danger" onClick={() => onDelete(h)}>{strings.admin.delete}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>{strings.admin.users}</h3>
        <table>
          <thead>
            <tr><th>{strings.admin.name}</th><th>{strings.admin.email}</th><th>{strings.admin.role}</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>{strings.admin.allBookings}</h3>
        <table>
          <thead>
            <tr><th>{strings.admin.ref}</th><th>{strings.admin.user}</th><th>{strings.admin.hotel}</th><th>{strings.admin.room}</th><th>{strings.admin.checkIn}</th><th>{strings.admin.checkOut}</th><th>{strings.admin.status}</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}><td>{b.bookingRef}</td><td>{b.userId}</td><td>{b.hotelId}</td><td>{b.roomId}</td><td>{b.checkInDate}</td><td>{b.checkOutDate}</td><td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}