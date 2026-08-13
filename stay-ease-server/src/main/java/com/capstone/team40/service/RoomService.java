package com.capstone.team40.service;

import com.capstone.team40.model.Room;
import com.capstone.team40.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

public class RoomService
{
    @Autowired
    private RoomRepository roomRepository;

    public List<Room> findActiveRoomsInHotel(UUID id)
    {
        return this.roomRepository.findByHotelIdAndActive(id, true);
    }
}
