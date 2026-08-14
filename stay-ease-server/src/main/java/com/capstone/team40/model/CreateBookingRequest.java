package com.capstone.team40.model;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateBookingRequest(UUID roomId, LocalDateTime checkInDate, LocalDateTime checkOutDate, String createdBy)
{
}
