import { useState } from 'react';
import { strings } from '../constants/strings';
import { CITY_OPTIONS } from '../constants/cities';

interface Props {
  onSearch: (city: string, checkIn: string, checkOut: string) => void;
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

// "YYYY-MM-DD" for today, used as the floor for both date inputs.
function todayStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SearchForm({ onSearch, initialCity = '', initialCheckIn = '', initialCheckOut = '' }: Props) {
  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [error, setError] = useState('');

  const today = todayStr();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!city.trim()) return setError(strings.search.cityRequired);
    if (!checkIn || !checkOut) return setError(strings.search.datesRequired);
    if (checkIn < today) return setError(strings.search.checkInPast);
    if (new Date(checkOut) <= new Date(checkIn)) return setError(strings.search.checkOutAfterCheckIn);
    onSearch(city.trim(), checkIn, checkOut);
  };

  const onCheckInChange = (value: string) => {
    setCheckIn(value);
    // If check-out is now before the new check-in, clear it so the user
    // can't submit a stale, now-invalid range.
    if (checkOut && checkOut <= value) setCheckOut('');
  };

  return (
    <form className="search-form" onSubmit={submit}>
      <div className="row">
        <label>
          <span className="field-label">{strings.search.destination}</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} required>
            <option value="">{strings.search.placeholderCity}</option>
            {CITY_OPTIONS.map((availableCity) => <option key={availableCity} value={availableCity}>{availableCity}</option>)}
          </select>
        </label>
        <label>
          <span className="field-label">{strings.search.checkIn}</span>
          <input type="date" min={today} value={checkIn} onChange={(e) => onCheckInChange(e.target.value)} />
        </label>
        <label>
          <span className="field-label">{strings.search.checkOut}</span>
          <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </label>
        <button className="primary-button" type="submit">{strings.search.searchHotels}</button>
      </div>

      {error && <div className="form-error">{error}</div>}
    </form>
  );
}