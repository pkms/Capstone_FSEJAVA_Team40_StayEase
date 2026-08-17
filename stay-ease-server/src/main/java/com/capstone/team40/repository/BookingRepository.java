package com.capstone.team40.repository;

import com.capstone.team40.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID>
{
    List<Booking> findByRoomIdIn(Set<UUID> roomIds);
    List<Booking> findByCreatedBy(String createdBy);
}
