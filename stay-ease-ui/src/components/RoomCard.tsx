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
        <span className="stub-label">Room type</span>
        <div className="room-type">{room.roomType}</div>
        <div className="room-number">No. {room.roomNumber}</div>
        {room.description && <p className="room-desc">{room.description}</p>}
        <div className="room-occupancy">Sleeps up to {room.maxOccupancy}</div>
      </div>

      <div className="room-stub">
        <span className="stub-label">Rate</span>
        <div className="price">₹{room.pricePerNight}</div>
        <span className="stub-sub">per night</span>
        <button className="small-button" onClick={() => onBook(room.id)}>Book</button>
      </div>
    </div>
  );
}