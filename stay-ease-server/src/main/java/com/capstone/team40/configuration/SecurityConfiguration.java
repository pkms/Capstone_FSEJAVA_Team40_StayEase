package com.capstone.team40.configuration;

import com.capstone.team40.filter.JwtTokenAuthorizationOncePerRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfiguration
{
    @Autowired
    private JwtTokenAuthorizationOncePerRequestFilter jwtTokenAuthorizationOncePerRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception
    {
        http
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for stateless APIs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()
                        .requestMatchers("/api/hotels")
                        .hasAuthority("GUEST")
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtTokenAuthorizationOncePerRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
