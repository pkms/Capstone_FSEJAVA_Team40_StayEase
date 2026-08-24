import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listUsers, listAllHotels, createHotel, updateHotel, deleteHotel } from '../api/mockApi';
import type { User, Hotel } from '../types';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';
import { CITY_OPTIONS } from '../constants/cities';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
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
    const name = form.name.trim();
    const description = form.description.trim();
    const coverImageUrl = form.coverImageUrl.trim();
    const rating = Number(form.starRating);
    if (!name) { show(strings.admin.hotelNameRequired, 'error'); return; }
    if (name.length > 100) { show(strings.admin.hotelNameTooLong, 'error'); return; }
    if (!CITY_OPTIONS.includes(form.city)) { show(strings.admin.cityRequired, 'error'); return; }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) { show(strings.admin.starRatingInvalid, 'error'); return; }
    if (!description) { show(strings.admin.descriptionRequired, 'error'); return; }
    if (description.length > 500) { show(strings.admin.descriptionTooLong, 'error'); return; }
    if (!coverImageUrl) { show(strings.admin.coverImageUrlRequired, 'error'); return; }
    if (coverImageUrl.length > 500) { show(strings.admin.coverImageUrlTooLong, 'error'); return; }
    if (coverImageUrl) {
      try { new URL(coverImageUrl); } catch { show(strings.admin.coverImageUrlInvalid, 'error'); return; }
    }
    if (form.managerId && !users.some((u) => u.id === form.managerId && u.role === 'MANAGER')) {
      show(strings.admin.managerInvalid, 'error');
      return;
    }
    try {
      if (editing) {
        await updateHotel(editing.id, { name, city: form.city, starRating: rating, description, coverImageUrl, managerId: form.managerId || undefined });
        show(strings.admin.hotelUpdated, 'success');
      } else {
        await createHotel({ name, city: form.city, starRating: rating, description, coverImageUrl, managerId: form.managerId || undefined });
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
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required maxLength={100} />
          </div>
          <div className="form-row">
            <label>{strings.admin.city}</label>
            <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required>
              <option value="">{strings.admin.selectCity}</option>
              {CITY_OPTIONS.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>{strings.admin.starRating}</label>
            <input type="number" min={1} max={5} step={1} value={String(form.starRating)} onChange={(e) => setForm((f) => ({ ...f, starRating: Number(e.target.value) }))} required />
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
            <input type="url" value={form.coverImageUrl} onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))} required maxLength={500} />
          </div>
          <div className="form-row">
            <label>{strings.admin.description}</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required maxLength={500} />
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

    </div>
  );
}