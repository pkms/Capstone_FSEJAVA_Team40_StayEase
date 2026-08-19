import { useEffect, useState } from 'react';
import { getHotelById, getAvailableRooms } from '../api/mockApi';
import type { Hotel, Room } from '../types';
import RoomCard from '../components/RoomCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';

export default function HotelDetail({ hotelId, query, navigate }: { hotelId: string; query: URLSearchParams; navigate: (hash: string) => void }) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { show } = useToast();

  useEffect(() => {
    setLoading(true);
    getHotelById(hotelId).then((h) => setHotel(h)).finally(() => setLoading(false));
  }, [hotelId]);

  useEffect(() => {
    const checkIn = query.get('checkIn') || '';
    const checkOut = query.get('checkOut') || '';
    if (!checkIn || !checkOut) return;
    setLoading(true);
    getAvailableRooms(hotelId, checkIn, checkOut).then((r) => setRooms(r)).finally(() => setLoading(false));
  }, [hotelId, query.toString()]);

  const onBook = (roomId: string) => {
    if (!user) {
      // show toast and redirect to login (preserve current hash)
      show(strings.hotelDetail.pleaseLoginToBook, 'warning');
      return navigate(`#/login?redirect=${encodeURIComponent(window.location.hash)}`);
    }
    const checkIn = query.get('checkIn')!;
    const checkOut = query.get('checkOut')!;
    navigate(`#/book?hotelId=${hotelId}&roomId=${roomId}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`);
  };

  if (loading && !hotel) return <div>{strings.hotelDetail.loading}</div>;
  if (!hotel) return <div>{strings.hotelDetail.hotelNotFound}</div>;

  return (
    <div className="page hotel-detail">
      <div className="cover" style={{ backgroundImage: `url(${hotel.coverImageUrl})` }} />
      <div className="card">
        <h2>{hotel.name} • {hotel.starRating}★</h2>
        <p>{hotel.description}</p>
        <h3>{strings.hotelDetail.availableRooms}</h3>
        {rooms.length === 0 && <div>{strings.hotelDetail.noRooms}</div>}
        <div className="rooms-grid">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} onBook={onBook} />
          ))}
        </div>
      </div>
    </div>
  );
}
