package com.capstone.team40.filter;

import com.capstone.team40.model.UserResponse;
import com.capstone.team40.service.JwtService;
import com.capstone.team40.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
@Slf4j
public class JwtTokenAuthorizationOncePerRequestFilter extends OncePerRequestFilter
{
    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException
    {
        log.debug("Authentication Request For '{}'", request.getRequestURL());

        String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer "))
        {
            jwtToken = requestTokenHeader.substring(7);
            try
            {
                username = jwtService.getUsernameFromToken(jwtToken);
            }
            catch (IllegalArgumentException e)
            {
                log.error("JWT_TOKEN_UNABLE_TO_GET_USERNAME", e);
            }
            catch (ExpiredJwtException e)
            {
                log.warn("JWT_TOKEN_EXPIRED", e);
            }
        }

        log.debug("JWT_TOKEN_USERNAME_VALUE '{}'", username);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null)
        {

            UserResponse userDetail = userService.forEmailId(username);

            if (jwtService.validateToken(jwtToken, userDetail))
            {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetail, null, Arrays.asList(userDetail.grantedAuthority()));

                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }

        chain.doFilter(request, response);
    }
}
