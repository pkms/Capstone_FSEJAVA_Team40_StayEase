package com.capstone.team40.model;

import com.capstone.team40.annotation.ValidLocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateBookingRequest(@NotNull UUID roomId, @NotBlank @ValidLocalDateTime LocalDateTime checkInDate, @NotBlank @ValidLocalDateTime LocalDateTime checkOutDate)
{
}
