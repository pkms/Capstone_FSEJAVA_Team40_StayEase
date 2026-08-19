package com.capstone.team40.repository;

import com.capstone.team40.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID>
{
    List<Booking> findByRoomIdIn(Set<UUID> roomIds);
    List<Booking> findByCreatedBy(String createdBy);
    Booking findByIdAndCreatedBy(UUID id, String createdBy);
    @Query("Select b from Booking b where roomId = ?1 and b.bookingStatus = 'COMPLETED' and ((?2 >= b.checkInDate and ?2 <= b.checkOutDate) or (?3 >= b.checkInDate and ?3 <= b.checkOutDate))")
    List<Booking> findByRoomIdAndCheckInDateAndCheckOutDate(UUID roomId, LocalDateTime checkInDate, LocalDateTime checkOutDate);
}
