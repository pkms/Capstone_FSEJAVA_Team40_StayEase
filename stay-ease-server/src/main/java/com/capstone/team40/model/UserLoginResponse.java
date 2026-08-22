package com.capstone.team40.model;

import java.util.UUID;

public record UserLoginResponse(String jwtToken, String role, UUID userId)
{
}
