package com.capstone.team40.service;

import com.capstone.team40.model.UserResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtService
{
    private final String secretKey;
    private final long expirationTime;
    public JwtService(String secretKey, long expirationTime)
    {
        this.secretKey = secretKey;
        this.expirationTime = expirationTime;
    }

    public String getUsernameFromToken(String token)
    {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver)
    {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token)
    {
        return Jwts.parser().setSigningKey(this.secretKey).build().parseSignedClaims(token).getPayload();
    }

    public String generateToken(String username)
    {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject)
    {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + this.expirationTime)) // Token valid for 1 hour
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSigningKey()
    {
        byte[] keyBytes = Decoders.BASE64.decode(this.secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Boolean isTokenExpired(String token)
    {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public Date getExpirationDateFromToken(String token)
    {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public Boolean validateToken(String token, UserResponse userDetails)
    {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.email()) && !isTokenExpired(token));
    }
}
