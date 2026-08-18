import React, { useState } from 'react';

interface Props {
  onSearch: (city: string, checkIn: string, checkOut: string) => void;
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

export default function SearchForm({ onSearch, initialCity = '', initialCheckIn = '', initialCheckOut = '' }: Props) {
  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!city.trim()) return setError('City is required');
    if (!checkIn || !checkOut) return setError('Check-in and Check-out are required');
    if (new Date(checkOut) <= new Date(checkIn)) return setError('Check-out must be after check-in');
    onSearch(city.trim(), checkIn, checkOut);
  };

  return (
    <form className="search-form" onSubmit={submit}>
      <div className="row">
        <label>
          <span className="field-label">Destination</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Goa" />
        </label>
        <label>
          <span className="field-label">Check-in</span>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </label>
        <label>
          <span className="field-label">Check-out</span>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </label>
        <button className="primary-button" type="submit">Search Hotels</button>
      </div>

      {error && <div className="form-error">{error}</div>}
    </form>
  );
}