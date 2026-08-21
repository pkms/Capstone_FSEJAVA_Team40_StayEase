package com.capstone.team40.model;

import com.capstone.team40.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponse(UUID id, HotelResponse hotel, RoomResponse room, LocalDateTime checkInDate, LocalDateTime checkOutDate, BookingStatus bookingStatus)
{

}
