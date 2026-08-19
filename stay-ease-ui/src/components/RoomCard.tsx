import type { Room } from '../types';
import { strings } from '../constants/strings';

interface Props {
  room: Room;
  onBook: (roomId: string) => void;
}

export default function RoomCard({ room, onBook }: Props) {
  return (
    <div className="room-card">
      <div className="room-main">
        <span className="stub-label">{strings.roomCard.roomType}</span>
        <div className="room-type">{room.roomType}</div>
        <div className="room-number">{strings.roomCard.roomNumberPrefix}{room.roomNumber}</div>
        {room.description && <p className="room-desc">{room.description}</p>}
        <div className="room-occupancy">{strings.roomCard.sleepsUpTo}{room.maxOccupancy}</div>
      </div>

      <div className="room-stub">
        <span className="stub-label">{strings.roomCard.rate}</span>
        <div className="price">₹{room.pricePerNight}</div>
        <span className="stub-sub">{strings.roomCard.perNight}</span>
        <button className="small-button" onClick={() => onBook(room.id)}>{strings.roomCard.book}</button>
      </div>
    </div>
  );
}