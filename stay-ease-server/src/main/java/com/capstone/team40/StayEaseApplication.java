package com.capstone.team40;

import com.capstone.team40.configuration.StayEaseConfigurationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(StayEaseConfigurationProperties.class)
public class StayEaseApplication
{
    public static void main(String[] args)
    {
        SpringApplication.run(StayEaseApplication.class, args);
    }
}
