package com.capstone.team40.model;

import com.capstone.team40.enums.RoomType;

import java.util.UUID;

public record RoomResponse(UUID roomId, UUID hotelId, int roomNumber, RoomType roomType, double pricePerNight, int maxOccupancy, boolean isActive)
{
}
