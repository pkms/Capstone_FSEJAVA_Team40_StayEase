package com.capstone.team40.repository;

import com.capstone.team40.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID>
{
    List<Room> findByHotelIdAndActive(UUID hotelId, boolean active);
    List<Room> findByIdIn(Set<UUID> uuids);
}
