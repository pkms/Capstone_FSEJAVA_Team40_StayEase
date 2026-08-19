import type { Hotel } from '../types';
import defaultImage from '../assets/hotel-default.svg';
import { strings } from '../constants/strings';

interface Props {
  hotel: Hotel;
  priceFrom?: number;
  onView: (hotelId: string) => void;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="stars" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? 'star star--filled' : 'star'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

export default function HotelCard({ hotel, priceFrom, onView }: Props) {
  return (
    <article className="hotel-card">
      <div className="hotel-image-wrap">
        <img
          src={hotel.coverImageUrl || defaultImage}
          alt={hotel.name}
          className="hotel-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultImage; }}
        />
        <span className="hotel-badge">{hotel.city}</span>
      </div>

      <div className="hotel-body">
        <div className="hotel-heading">
          <h3>{hotel.name}</h3>
          <Stars rating={hotel.starRating} />
        </div>
        <p className="desc">{hotel.description}</p>
      </div>

      <div className="hotel-stub">
        <span className="stub-label">{strings.hotelCard.rateFrom}</span>
        <div className="price">₹{priceFrom ?? '—'}</div>
        <span className="stub-sub">{strings.hotelCard.perNight}</span>
        <button className="small-button" onClick={() => onView(hotel.id)}>{strings.hotelCard.viewRooms}</button>
      </div>
    </article>
  );
}