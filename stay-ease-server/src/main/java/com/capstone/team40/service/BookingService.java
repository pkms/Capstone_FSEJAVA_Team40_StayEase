package com.capstone.team40.service;

import com.capstone.team40.model.Booking;
import com.capstone.team40.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public class BookingService
{
    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> getBookingDetails(Set<UUID> roomIds)
    {
        return this.bookingRepository.findByRoomIdIn(roomIds);
    }
}
