package com.capstone.team40.service;

import com.capstone.team40.model.CreateUserRequest;
import com.capstone.team40.model.LoginRequest;
import com.capstone.team40.entity.User;
import com.capstone.team40.model.UserResponse;
import com.capstone.team40.repository.UserRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserService
{
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean registerUser(CreateUserRequest createUserRequest)
    {
        if(userRepository.findByEmail(createUserRequest.email()) != null)
        {
            return false;
        }
        this.userRepository.save(ConvertUtils.toUser(createUserRequest, passwordEncoder));
        return true;
    }

    public UserResponse login(LoginRequest loginRequest)
    {
        User user = userRepository.findByEmail(loginRequest.email());
        if(user != null)
        {
            return passwordEncoder.matches(loginRequest.password(), user.getPasswordHash()) ? ConvertUtils.toUserResponse(user) : null;
        }
        return null;
    }

    public UserResponse forEmailId(String email)
    {
        User user = userRepository.findByEmail(email);
        if(user == null)
        {
            throw new UsernameNotFoundException("User name does not exists in the system !");
        }
        return ConvertUtils.toUserResponse(user);
    }
}
