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
          City
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (e.g. Goa)" />
        </label>
        <label>
          Check-in
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </label>
        <label>
          Check-out
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="row actions">
        <button className="primary-button" type="submit">Search Hotels</button>
      </div>
    </form>
  );
}
