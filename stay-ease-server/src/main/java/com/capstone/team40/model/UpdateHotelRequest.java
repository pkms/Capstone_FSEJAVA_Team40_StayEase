package com.capstone.team40.model;

import jakarta.validation.constraints.NotBlank;

public record UpdateHotelRequest(@NotBlank String name, @NotBlank String city, @NotBlank String description, @NotBlank String coverImageUrl)
{
}
