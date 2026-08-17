package com.capstone.team40.service;

import com.capstone.team40.entity.Booking;
import com.capstone.team40.entity.Room;
import com.capstone.team40.enums.BookingStatus;
import com.capstone.team40.model.BookingResponse;
import com.capstone.team40.model.CreateBookingRequest;
import com.capstone.team40.repository.BookingRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class BookingService
{
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomService roomService;

    public List<Booking> getBookingDetails(Set<UUID> roomIds)
    {
        return this.bookingRepository.findByRoomIdIn(roomIds);
    }

    public UUID createBooking(CreateBookingRequest createBookingRequest)
    {
        Booking booking = ConvertUtils.toBooking(createBookingRequest);
        booking.setBookingStatus(BookingStatus.COMPLETED);

        return this.bookingRepository.save(booking).getId();
    }

    public List<BookingResponse> forLoggedInUser(String loggedInUser)
    {
        List<Booking> bookings = this.bookingRepository.findByCreatedBy(loggedInUser);
        Set<UUID> roomIds = bookings.stream().map(Booking::getRoomId).collect(Collectors.toSet());
        Map<UUID,Room> roomIdAndRoomMap = this.roomService.findByRoomIds(roomIds).stream()
                .collect(Collectors.toMap(Room::getId, Function.identity()));
        return bookings.stream().map(booking -> ConvertUtils.toBookingResponse(booking, roomIdAndRoomMap.get(booking.getRoomId()))).collect(Collectors.toList());
    }

    public Booking cancelBooking(UUID bookingId)
    {
        Booking booking = this.bookingRepository.findById(bookingId).orElse(null);
        if(booking != null)
        {
            booking.setBookingStatus(BookingStatus.CANCELLED);
        }
        return booking;
    }
}
