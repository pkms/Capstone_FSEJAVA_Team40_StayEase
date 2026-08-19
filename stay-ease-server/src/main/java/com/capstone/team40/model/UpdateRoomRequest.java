package com.capstone.team40.model;

import com.capstone.team40.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.hibernate.validator.constraints.Range;

public record UpdateRoomRequest(@NotBlank RoomType roomType, @Positive double pricePerNight, @Range(min=1, max=5) int maxOccupancy)
{
}
