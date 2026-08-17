package com.capstone.team40.configuration;

import com.capstone.team40.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class StayEaseConfiguration
{
    @Autowired
    private StayEaseConfigurationProperties stayEaseConfigurationProperties;
    @Bean
    public JwtService jwtService()
    {
        return new JwtService(this.stayEaseConfigurationProperties.security().jwt().secretKey(),
                this.stayEaseConfigurationProperties.security().jwt().expirationTime());
    }

    @Bean
    public PasswordEncoder passwordEncoder()
    {
        // Default strength is 10 rounds of hashing
        return new BCryptPasswordEncoder();
    }
}
