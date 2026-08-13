package com.capstone.team40.model;

import java.util.UUID;

public record HotelResponse(UUID id, String name, String city, int starRating, String description, String coverImageUrl)
{
}
