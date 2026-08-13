package com.capstone.team40.utils;

import com.capstone.team40.enums.Role;
import com.capstone.team40.model.CreateUserRequest;
import com.capstone.team40.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;

public class ConvertUtils
{
    public static User toUser(CreateUserRequest createUserRequest, PasswordEncoder passwordEncoder)
    {
        User user = new User();
        user.setName(createUserRequest.name());
        user.setEmail(createUserRequest.email());
        user.setRole(Role.GUEST);
        user.setPasswordHash(passwordEncoder.encode(createUserRequest.password()));
        return user;
    }
}
