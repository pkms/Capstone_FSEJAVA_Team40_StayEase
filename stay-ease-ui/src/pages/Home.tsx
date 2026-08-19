import SearchForm from '../components/SearchForm';
import { strings } from '../constants/strings';

export default function Home({ navigate }: { navigate: (hash: string) => void }) {
  const onSearch = (city: string, checkIn: string, checkOut: string) => {
    const q = `#/hotels?city=${encodeURIComponent(city)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`;
    navigate(q);
  };

  return (
    <div className="page home">
      <section className="hero card">
        <h1>{strings.home.title}</h1>
        <p>{strings.home.subtitle}</p>
        <SearchForm onSearch={onSearch} />
      </section>

      <section className="promo card">
        <h2>{strings.home.seededHotels}</h2>
        <p>{strings.home.cityHint}<strong>{strings.home.cityExample}</strong> {strings.home.pickDates}</p>
      </section>
    </div>
  );
}
