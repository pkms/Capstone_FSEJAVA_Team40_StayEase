package com.capstone.team40.utils;

import com.capstone.team40.enums.Role;
import com.capstone.team40.model.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.stream.Collectors;

public class ConvertUtils
{
    public static User toUser(CreateUserRequest createUserRequest, PasswordEncoder passwordEncoder)
    {
        User user = new User();
        user.setName(createUserRequest.name());
        user.setEmail(createUserRequest.email());
        user.setRole(Role.GUEST);
        user.setPasswordHash(passwordEncoder.encode(createUserRequest.password()));
        return user;
    }

    public static List<HotelResponse> toHotelResponse(List<Hotel> hotelList)
    {
        return hotelList.stream().map(hotel -> new HotelResponse(hotel.getId(), hotel.getName(), hotel.getCity(), hotel.getStarRating(), hotel.getDescription(), hotel.getCoverImageUrl()))
               .collect(Collectors.toList());
    }

    public static List<RoomResponse> toRoomResponse(List<Room> roomList)
    {
        return roomList.stream().map(room -> new RoomResponse(room.getId(), room.getHotelId(), room.getRoomNumber(), room.getRoomType(), room.getPricePerNight(), room.getMaxOccupancy()))
                .collect(Collectors.toList());
    }

    public static Booking toBooking(CreateBookingRequest createBookingRequest)
    {
        Booking booking = new Booking();
        booking.setRoomId(createBookingRequest.roomId());
        booking.setCheckInDate(createBookingRequest.checkInDate());
        booking.setCheckOutDate(createBookingRequest.checkOutDate());
        booking.setCreatedBy(createBookingRequest.createdBy());
        return booking;
    }
}
