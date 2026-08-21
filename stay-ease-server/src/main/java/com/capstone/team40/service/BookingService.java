package com.capstone.team40.service;

import com.capstone.team40.entity.Booking;
import com.capstone.team40.entity.Hotel;
import com.capstone.team40.entity.Room;
import com.capstone.team40.enums.BookingStatus;
import com.capstone.team40.model.BookingResponse;
import com.capstone.team40.model.CreateBookingRequest;
import com.capstone.team40.repository.BookingRepository;
import com.capstone.team40.repository.HotelRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
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

    @Autowired
    private HotelRepository hotelRepository;

    public List<Booking> getBookingDetails(Set<UUID> roomIds)
    {
        return this.bookingRepository.findByRoomIdIn(roomIds).stream().filter(booking -> "COMPLETED".equals(booking.getBookingStatus().name())).collect(Collectors.toList());
    }

    public boolean isRoomAvailable(UUID roomId, LocalDateTime checkInDate, LocalDateTime checkOutDate)
    {
        return this.bookingRepository.findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkInDate, checkOutDate).isEmpty();
    }

    public Booking createBooking(CreateBookingRequest createBookingRequest) throws BadRequestException
    {
        if(createBookingRequest.checkInDate().plusDays(1).isAfter(createBookingRequest.checkOutDate()))
        {
            throw new BadRequestException("Booking for minimum 1 Day is must. Please select Check In and Check Out Date accordingly.");
        }
        if(this.roomService.findByRoomId(createBookingRequest.roomId()) == null)
        {
            throw new BadRequestException("Room with provided Room ID is not yet created in the System.");
        }
        if(!this.isRoomAvailable(createBookingRequest.roomId(), createBookingRequest.checkInDate(), createBookingRequest.checkOutDate()))
        {
            throw new BadRequestException("Room with provided Room ID is already booked on the provided Check In and Check Out Date.");
        }
        Booking booking = ConvertUtils.toBooking(createBookingRequest);
        booking.setBookingStatus(BookingStatus.COMPLETED);
        booking.setCreatedBy(SecurityContextHolder.getContext().getAuthentication().getName());

        return this.bookingRepository.save(booking);
    }

    public List<BookingResponse> forLoggedInUser(String loggedInUser)
    {
        List<Booking> bookings = this.bookingRepository.findByCreatedBy(loggedInUser);
        return this.getDetailedBooking(bookings);
    }

    private List<BookingResponse> getDetailedBooking(List<Booking> bookings)
    {
        Set<UUID> roomIds = bookings.stream().map(Booking::getRoomId).collect(Collectors.toSet());
        List<Room> rooms = this.roomService.findByRoomIds(roomIds);
        Map<UUID,Room> roomIdAndRoomMap = rooms.stream()
                .collect(Collectors.toMap(Room::getId, Function.identity()));
        Set<UUID> hotelIds = rooms.stream().map(Room::getHotelId).collect(Collectors.toSet());
        Map<UUID, Hotel> hotelIdAndHotelMap = this.hotelRepository.findAllById(hotelIds).stream().collect(Collectors.toMap(Hotel::getId, Function.identity()));
        return bookings.stream().map(booking -> ConvertUtils.toBookingResponse(booking, hotelIdAndHotelMap.get(roomIdAndRoomMap.get(booking.getRoomId()).getHotelId()), roomIdAndRoomMap.get(booking.getRoomId()))).collect(Collectors.toList());
    }

    public Booking cancelBooking(UUID bookingId, String userName)
    {
        Booking booking = this.bookingRepository.findByIdAndCreatedBy(bookingId, userName);
        if(booking != null)
        {
            booking.setBookingStatus(BookingStatus.CANCELLED);
            this.bookingRepository.save(booking);
        }
        return booking;
    }

    public List<BookingResponse> getUpcomingBookings(long days)
    {
        LocalDateTime currentDateTime = LocalDateTime.now();
        return this.getDetailedBooking(this.bookingRepository.findBookingsBetween(currentDateTime, currentDateTime.plusDays(days)));
    }
}
