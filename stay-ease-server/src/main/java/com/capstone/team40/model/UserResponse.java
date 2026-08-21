package com.capstone.team40.model;

import org.springframework.security.core.GrantedAuthority;

import java.util.UUID;

public record UserResponse(String email, GrantedAuthority grantedAuthority, UUID id, String name)
{
}
