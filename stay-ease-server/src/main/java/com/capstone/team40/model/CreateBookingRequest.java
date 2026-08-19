package com.capstone.team40.model;

import com.capstone.team40.annotation.ValidLocalDateTime;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateBookingRequest(@NotBlank UUID roomId, @NotBlank @ValidLocalDateTime LocalDateTime checkInDate, @NotBlank @ValidLocalDateTime LocalDateTime checkOutDate)
{
}
