package com.capstone.team40.configuration;

import com.capstone.team40.filter.JwtTokenAuthorizationOncePerRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfiguration
{
    @Autowired
    private JwtTokenAuthorizationOncePerRequestFilter jwtTokenAuthorizationOncePerRequestFilter;

    // Allows the Vite dev server (localhost:5173) to call this API from the browser.
    // Add any other frontend origins (e.g. a deployed URL) to allowedOrigins later.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception
    {
        http
                .cors(Customizer.withDefaults()) // picks up the corsConfigurationSource bean above
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for stateless APIs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()
                        .requestMatchers("/api/hotels/create","/api/hotels/{id}/update","/api/hotels/{id}/delete","/api/users/{role}")
                        .hasAuthority("ADMIN")
                        .requestMatchers("/api/hotels/{id}/createRoom","/api/rooms/**")
                        .hasAuthority("MANAGER")
                        .requestMatchers("/api/hotels/all")
                        .hasAnyAuthority("ADMIN","MANAGER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtTokenAuthorizationOncePerRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout") // Define logout endpoint
                        .logoutSuccessHandler((request, response, authentication) ->
                                SecurityContextHolder.clearContext() // Fallback context clearing
                        )
                );
        return http.build();
    }
}