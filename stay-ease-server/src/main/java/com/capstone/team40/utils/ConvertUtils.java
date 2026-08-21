package com.capstone.team40.utils;

import com.capstone.team40.entity.Booking;
import com.capstone.team40.entity.Hotel;
import com.capstone.team40.entity.Room;
import com.capstone.team40.entity.User;
import com.capstone.team40.enums.Role;
import com.capstone.team40.model.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
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
        return hotelList.stream().map(hotel -> new HotelResponse(hotel.getId(), hotel.getName(), hotel.getCity(), hotel.getStarRating(), hotel.getDescription(), hotel.getCoverImageUrl(), hotel.getManagerId()))
               .collect(Collectors.toList());
    }

    public static List<RoomResponse> toRoomResponse(List<Room> roomList)
    {
        return roomList.stream().map(room -> new RoomResponse(room.getId(), room.getHotelId(), room.getRoomNumber(), room.getRoomType(), room.getPricePerNight(), room.getMaxOccupancy()))
                .collect(Collectors.toList());
    }

    public static RoomResponse toRoomResponse(Room room)
    {
        return new RoomResponse(room.getId(), room.getHotelId(), room.getRoomNumber(), room.getRoomType(), room.getPricePerNight(), room.getMaxOccupancy());
    }

    public static UserResponse toUserResponse(User user)
    {
        return new UserResponse(user.getEmail(), new SimpleGrantedAuthority(user.getRole().name()), user.getId(), user.getName());
    }

    public static List<UserResponse> toUserResponse(List<User> users)
    {
        return users.stream().map(user -> new UserResponse(user.getEmail(), new SimpleGrantedAuthority(user.getRole().name()), user.getId(), user.getName())).collect(Collectors.toList());
    }

    public static Booking toBooking(CreateBookingRequest createBookingRequest)
    {
        Booking booking = new Booking();
        booking.setRoomId(createBookingRequest.roomId());
        booking.setCheckInDate(createBookingRequest.checkInDate());
        booking.setCheckOutDate(createBookingRequest.checkOutDate());
        return booking;
    }

    public static BookingResponse toBookingResponse(Booking booking, Room room)
    {
        return new BookingResponse(booking.getId(), toRoomResponse(room), booking.getCheckInDate(), booking.getCheckOutDate(), booking.getBookingStatus());
    }

    public static Hotel toHotel(CreateHotelRequest createHotelRequest)
    {
        Hotel hotel = new Hotel();
        hotel.setCity(createHotelRequest.city());
        hotel.setName(createHotelRequest.name());
        hotel.setDescription(createHotelRequest.description());
        hotel.setStarRating(createHotelRequest.starRating());
        hotel.setCoverImageUrl(createHotelRequest.coverImageUrl());
        hotel.setManagerId(createHotelRequest.managerId());
        hotel.setCreatedAt(LocalDateTime.now());
        return hotel;
    }
}
