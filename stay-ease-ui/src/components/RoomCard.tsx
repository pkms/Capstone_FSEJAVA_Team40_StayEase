import React from 'react';
import type { Room } from '../types';

interface Props {
  room: Room;
  onBook: (roomId: string) => void;
}

export default function RoomCard({ room, onBook }: Props) {
  return (
    <div className="room-card">
      <div className="room-main">
        <div className="room-type">{room.roomType}</div>
        <div className="room-number">#{room.roomNumber}</div>
        <div className="room-desc">{room.description ?? ''}</div>
      </div>
      <div className="room-side">
        <div className="price">₹{room.pricePerNight}/night</div>
        <div className="occupancy">Max: {room.maxOccupancy}</div>
        <button className="small-button" onClick={() => onBook(room.id)}>Book</button>
      </div>
    </div>
  );
}
