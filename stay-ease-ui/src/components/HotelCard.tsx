import React from 'react';
import type { Hotel } from '../types';
import defaultImage from '../assets/hotel-default.svg';

interface Props {
  hotel: Hotel;
  priceFrom?: number;
  onView: (hotelId: string) => void;
}

export default function HotelCard({ hotel, priceFrom, onView }: Props) {
  return (
    <article className="hotel-card">
      <img
        src={hotel.coverImageUrl || defaultImage}
        alt={hotel.name}
        className="hotel-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultImage; }}
      />
      <div className="hotel-body">
        <h3>{hotel.name}</h3>
        <div className="meta">{hotel.city} • {hotel.starRating}★</div>
        <p className="desc">{hotel.description}</p>
        <div className="row footer">
          <div className="price">From ₹{priceFrom ?? '—'}/night</div>
          <button className="small-button" onClick={() => onView(hotel.id)}>View Rooms</button>
        </div>
      </div>
    </article>
  );
}
