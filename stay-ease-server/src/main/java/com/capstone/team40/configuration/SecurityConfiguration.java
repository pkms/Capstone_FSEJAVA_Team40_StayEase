package com.capstone.team40.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfiguration
{
    @Bean
    public PasswordEncoder passwordEncoder()
    {
        // Default strength is 10 rounds of hashing
        return new BCryptPasswordEncoder();
    }
}
