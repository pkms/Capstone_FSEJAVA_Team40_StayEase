package com.capstone.team40.service;

import com.capstone.team40.entity.Hotel;
import com.capstone.team40.entity.Room;
import com.capstone.team40.model.RoomResponse;
import com.capstone.team40.model.UpdateRoomRequest;
import com.capstone.team40.repository.HotelRepository;
import com.capstone.team40.repository.RoomRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class RoomService
{
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public List<Room> findActiveRoomsInHotel(UUID id)
    {
        return this.roomRepository.findByHotelIdAndActive(id, true);
    }

    public List<Room> findByRoomIds(Set<UUID> roomIds)
    {
        return this.roomRepository.findByIdIn(roomIds);
    }

    public Room findByRoomId(UUID roomId)
    {
        return this.roomRepository.findById(roomId).orElse(null);
    }

    public Room addRoom(Room room)
    {
        return this.roomRepository.save(room);
    }

    public Room updateRoom(UpdateRoomRequest updateRoomRequest, UUID id)
    {
        Room roomToUpdate = this.roomRepository.findById(id).orElse(null);
        if(roomToUpdate != null)
        {
            roomToUpdate.setRoomType(updateRoomRequest.roomType());
            roomToUpdate.setPricePerNight(updateRoomRequest.pricePerNight());
            roomToUpdate.setMaxOccupancy(updateRoomRequest.maxOccupancy());
            roomToUpdate = this.roomRepository.save(roomToUpdate);
        }
        return roomToUpdate;
    }

    public void deleteRoom(UUID uuid)
    {
        this.roomRepository.deleteById(uuid);
    }

    public Room toggleStatus(UUID uuid, boolean active)
    {
        Room roomToToggle = this.roomRepository.findById(uuid).orElse(null);
        if(roomToToggle != null)
        {
            roomToToggle.setActive(active);
            roomToToggle = this.roomRepository.save(roomToToggle);
        }
        return roomToToggle;
    }

    public List<RoomResponse> getRooms(UUID managerId)
    {
        Set<UUID> hotelIds = this.hotelRepository.findByManagerId(managerId).stream().map(Hotel::getId).collect(Collectors.toSet());
        return ConvertUtils.toRoomResponse(this.roomRepository.findByHotelIdIn(hotelIds));
    }

}
