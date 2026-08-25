package com.capstone.team40.model;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Range;

public record UpdateHotelRequest(@NotBlank String name, @NotBlank String city, @NotBlank String description, @Range(min=1, max=5) int starRating, @NotBlank String coverImageUrl)
{
}
