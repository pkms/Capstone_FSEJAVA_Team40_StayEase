package com.capstone.team40.model;

import org.springframework.security.core.GrantedAuthority;

public record UserResponse(String email, GrantedAuthority grantedAuthority)
{
}
