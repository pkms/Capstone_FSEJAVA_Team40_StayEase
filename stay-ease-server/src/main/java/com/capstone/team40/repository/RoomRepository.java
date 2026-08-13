package com.capstone.team40.repository;

import com.capstone.team40.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID>
{
    List<Room> findByHotelIdAndActive(UUID hotelId, boolean active);
}
