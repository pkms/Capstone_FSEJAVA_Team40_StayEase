import React from 'react';
import SearchForm from '../components/SearchForm';

export default function Home({ navigate }: { navigate: (hash: string) => void }) {
  const onSearch = (city: string, checkIn: string, checkOut: string) => {
    const q = `#/hotels?city=${encodeURIComponent(city)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`;
    navigate(q);
  };

  return (
    <div className="page home">
      <section className="hero card">
        <h1>Find and book hotel rooms — simple, in minutes</h1>
        <p>Search hotels by city and dates. This is a UI-only mock implementing the StayEase flows.</p>
        <SearchForm onSearch={onSearch} />
      </section>

      <section className="promo card">
        <h2>Seeded hotels</h2>
        <p>Try searching for city: <strong>Goa</strong> and pick dates.</p>
      </section>
    </div>
  );
}
