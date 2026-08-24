package com.capstone.team40.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateHotelRequest(@NotBlank String name, @NotBlank String city, @NotBlank String description, @NotNull int starRating, @NotBlank String coverImageUrl)
{
}
