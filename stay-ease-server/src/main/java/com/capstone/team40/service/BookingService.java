package com.capstone.team40.service;

import com.capstone.team40.model.Booking;
import com.capstone.team40.model.CreateBookingRequest;
import com.capstone.team40.repository.BookingRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
public class BookingService
{
    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> getBookingDetails(Set<UUID> roomIds)
    {
        return this.bookingRepository.findByRoomIdIn(roomIds);
    }

    public UUID createBooking(CreateBookingRequest createBookingRequest)
    {
        return this.bookingRepository.save(ConvertUtils.toBooking(createBookingRequest)).getId();
    }
}
