package com.capstone.team40.model;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Range;

import java.util.UUID;

public record CreateHotelRequest(@NotBlank String name, @NotBlank String city, @Range(min=1, max=5) int starRating, @NotBlank String description, @NotBlank String coverImageUrl, @NotBlank UUID managerId)
{
}
