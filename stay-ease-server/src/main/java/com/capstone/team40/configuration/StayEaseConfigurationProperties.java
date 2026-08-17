package com.capstone.team40.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties
public record StayEaseConfigurationProperties(Security security)
{
    record Security(JwtConfiguration jwt)
    {
        record JwtConfiguration(String secretKey, long expirationTime)
        {

        }
    }
}
