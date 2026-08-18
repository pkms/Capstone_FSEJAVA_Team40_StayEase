import React, { useEffect, useState } from 'react';
import { searchHotels } from '../api/mockApi';
import type { Hotel } from '../types';
import HotelCard from '../components/HotelCard';

export default function HotelsList({ query, navigate }: { query: URLSearchParams; navigate: (hash: string) => void }) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const city = query.get('city') || '';
    if (!city) return;
    setLoading(true);
    searchHotels(city).then((res) => setHotels(res)).finally(() => setLoading(false));
  }, [query.toString()]);

  return (
    <div className="page hotels-list">
      <h2>Hotels</h2>
      {loading && <div>Loading…</div>}
      {!loading && hotels.length === 0 && <div>No hotels found for that city.</div>}
      <div className="list-grid">
        {hotels.map((h) => (
          <HotelCard key={h.id} hotel={h} priceFrom={1000} onView={(id) => navigate(`#/hotel/${id}?checkIn=${encodeURIComponent(query.get('checkIn')||'')}&checkOut=${encodeURIComponent(query.get('checkOut')||'')}`)} />
        ))}
      </div>
    </div>
  );
}
