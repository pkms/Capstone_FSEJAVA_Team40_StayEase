import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listUsers, getAllBookings, listAllHotels, createHotel, updateHotel, deleteHotel } from '../api/mockApi';
import type { User, Booking, Hotel } from '../types';
import { useToast } from '../contexts/ToastContext';

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
      show('Access denied: admin only', 'error');
      window.location.hash = '#/';
      return;
    }
    listUsers().then((u) => setUsers(u));
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
    if (!confirm(`Delete hotel "${h.name}"? This will remove its rooms.`)) return;
    try {
      await deleteHotel(h.id);
      show('Hotel deleted', 'info');
      const updated = await listAllHotels();
      setHotels(updated);
    } catch (err: any) {
      show(err?.message || 'Delete failed', 'error');
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) { show('Name and city required', 'error'); return; }
    try {
      if (editing) {
        await updateHotel(editing.id, { name: form.name, city: form.city, starRating: Number(form.starRating), description: form.description, coverImageUrl: form.coverImageUrl, managerId: form.managerId || undefined });
        show('Hotel updated', 'success');
      } else {
        await createHotel({ name: form.name, city: form.city, starRating: Number(form.starRating), description: form.description, coverImageUrl: form.coverImageUrl, managerId: form.managerId || undefined });
        show('Hotel created', 'success');
      }
      const updated = await listAllHotels();
      setHotels(updated);
      resetForm();
    } catch (err: any) {
      show(err?.message || 'Save failed', 'error');
    }
  };

  return (
    <div className="page admin card">
      <h2>Admin Dashboard</h2>

      <section className="hotel-form card">
        <h3>{editing ? `Edit Hotel: ${editing.name}` : 'Create New Hotel'}</h3>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <label>Hotel name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Star rating</label>
            <input type="number" min={1} max={5} value={String(form.starRating)} onChange={(e) => setForm((f) => ({ ...f, starRating: Number(e.target.value) }))} />
          </div>
          <div className="form-row">
            <label>Manager</label>
            <select value={form.managerId} onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))}>
              <option value="">(none)</option>
              {users.filter((u) => u.role === 'MANAGER').map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Cover image URL</label>
            <input value={form.coverImageUrl} onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <button type="submit" className="primary-button">{editing ? 'Save changes' : 'Create hotel'}</button>
            {editing && <button type="button" className="small-button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>

      <section>
        <h3>Hotels</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>City</th><th>Stars</th><th>Manager</th><th></th></tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.city}</td>
                <td>{h.starRating}</td>
                <td>{(users.find((u) => u.id === h.managerId)?.name) ?? '-'}</td>
                <td>
                  <button className="small-button" onClick={() => onEdit(h)}>Edit</button>
                  <button className="small-button danger" onClick={() => onDelete(h)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Users</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>All Bookings</h3>
        <table>
          <thead>
            <tr><th>Ref</th><th>User</th><th>Hotel</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}><td>{b.bookingRef}</td><td>{b.userId}</td><td>{b.hotelId}</td><td>{b.roomId}</td><td>{b.checkInDate}</td><td>{b.checkOutDate}</td><td>{b.status}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
