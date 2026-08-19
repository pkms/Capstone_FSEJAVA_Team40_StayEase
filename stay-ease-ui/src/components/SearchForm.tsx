import { useState } from 'react';
import { strings } from '../constants/strings';

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
    if (!city.trim()) return setError(strings.search.cityRequired);
    if (!checkIn || !checkOut) return setError(strings.search.datesRequired);
    if (new Date(checkOut) <= new Date(checkIn)) return setError(strings.search.checkOutAfterCheckIn);
    onSearch(city.trim(), checkIn, checkOut);
  };

  return (
    <form className="search-form" onSubmit={submit}>
      <div className="row">
        <label>
          <span className="field-label">{strings.search.destination}</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={strings.search.placeholderCity} />
        </label>
        <label>
          <span className="field-label">{strings.search.checkIn}</span>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </label>
        <label>
          <span className="field-label">{strings.search.checkOut}</span>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </label>
        <button className="primary-button" type="submit">{strings.search.searchHotels}</button>
      </div>

      {error && <div className="form-error">{error}</div>}
    </form>
  );
}