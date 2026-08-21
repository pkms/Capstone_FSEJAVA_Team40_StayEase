package com.capstone.team40.service;

import com.capstone.team40.model.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtServiceTest {

    private JwtService jwtService;

    private String secretKey;

    private static final long EXPIRATION_TIME = 3600000L; // 1 hour


    @BeforeEach
    void setUp() {

        /*
         * JWT HS256 requires a sufficiently long secret key.
         * Generate a Base64 encoded 32-byte key.
         */
        byte[] keyBytes = new byte[32];

        for (int i = 0; i < keyBytes.length; i++) {
            keyBytes[i] = (byte) i;
        }

        secretKey = Base64.getEncoder()
                .encodeToString(keyBytes);

        jwtService = new JwtService(
                secretKey,
                EXPIRATION_TIME
        );
    }


    // =========================================================
    // generateToken() TESTS
    // =========================================================

    @Test
    void generateToken_shouldGenerateValidToken() {

        // Arrange
        String username = "test@example.com";

        // Act
        String token =
                jwtService.generateToken(username);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // JWT should contain Header.Payload.Signature
        assertEquals(
                3,
                token.split("\\.").length
        );
    }


    @Test
    void generateToken_shouldContainCorrectUsername() {

        // Arrange
        String username = "test@example.com";

        // Act
        String token =
                jwtService.generateToken(username);

        String result =
                jwtService.getUsernameFromToken(token);

        // Assert
        assertEquals(username, result);
    }


    // =========================================================
    // getUsernameFromToken() TESTS
    // =========================================================

    @Test
    void getUsernameFromToken_shouldReturnUsername() {

        // Arrange
        String username = "john@example.com";

        String token =
                jwtService.generateToken(username);

        // Act
        String result =
                jwtService.getUsernameFromToken(token);

        // Assert
        assertEquals(username, result);
    }


    // =========================================================
    // getExpirationDateFromToken() TESTS
    // =========================================================

    @Test
    void getExpirationDateFromToken_shouldReturnFutureDate() {

        // Arrange
        String username = "test@example.com";

        String token =
                jwtService.generateToken(username);

        // Act
        Date expiration =
                jwtService.getExpirationDateFromToken(token);

        // Assert
        assertNotNull(expiration);
        assertTrue(expiration.after(new Date()));
    }

/*
    @Test
    void getExpirationDateFromToken_shouldBeApproximatelyOneHourFromNow() {

        // Arrange
        String username = "test@example.com";

        long beforeGeneration =
                System.currentTimeMillis();

        String token =
                jwtService.generateToken(username);

        long afterGeneration =
                System.currentTimeMillis();

        // Act
        Date expiration =
                jwtService.getExpirationDateFromToken(token);

        long actualExpirationTime =
                expiration.getTime();

        // Assert
        assertTrue(
                actualExpirationTime >=
                        beforeGeneration + EXPIRATION_TIME
        );

        assertTrue(
                actualExpirationTime <=
                        afterGeneration + EXPIRATION_TIME
        );
    }*/


    // =========================================================
    // getClaimFromToken() TESTS
    // =========================================================

    @Test
    void getClaimFromToken_shouldReturnSubject() {

        // Arrange
        String username = "test@example.com";

        String token =
                jwtService.generateToken(username);

        // Act
        String result =
                jwtService.getClaimFromToken(
                        token,
                        claims -> claims.getSubject()
                );

        // Assert
        assertEquals(username, result);
    }


    @Test
    void getClaimFromToken_shouldReturnExpiration() {

        // Arrange
        String username = "test@example.com";

        String token =
                jwtService.generateToken(username);

        // Act
        Date result =
                jwtService.getClaimFromToken(
                        token,
                        claims -> claims.getExpiration()
                );

        // Assert
        assertNotNull(result);
        assertTrue(result.after(new Date()));
    }


    // =========================================================
    // validateToken() TESTS
    // =========================================================

    @Test
    void validateToken_shouldReturnTrue_whenUsernameMatches() {

        // Arrange
        String username = "test@example.com";

        String token =
                jwtService.generateToken(username);

        /*
         * Mock UserResponse instead of creating it through
         * its constructor. This avoids dependency on the
         * number of fields in UserResponse.
         */
        UserResponse userResponse =
                mock(UserResponse.class);

        when(userResponse.email())
                .thenReturn(username);

        // Act
        Boolean result =
                jwtService.validateToken(
                        token,
                        userResponse
                );

        // Assert
        assertTrue(result);

        verify(userResponse)
                .email();
    }


    @Test
    void validateToken_shouldReturnFalse_whenUsernameDoesNotMatch() {

        // Arrange
        String token =
                jwtService.generateToken(
                        "test@example.com"
                );

        UserResponse userResponse =
                mock(UserResponse.class);

        when(userResponse.email())
                .thenReturn(
                        "different@example.com"
                );

        // Act
        Boolean result =
                jwtService.validateToken(
                        token,
                        userResponse
                );

        // Assert
        assertFalse(result);

        verify(userResponse)
                .email();
    }


    // =========================================================
    // INVALID TOKEN TESTS
    // =========================================================

    @Test
    void getUsernameFromToken_shouldThrowException_whenTokenIsInvalid() {

        // Arrange
        String invalidToken =
                "invalid.jwt.token";

        // Act & Assert
        assertThrows(
                Exception.class,
                () -> jwtService.getUsernameFromToken(
                        invalidToken
                )
        );
    }


    @Test
    void getExpirationDateFromToken_shouldThrowException_whenTokenIsInvalid() {

        // Arrange
        String invalidToken =
                "invalid.jwt.token";

        // Act & Assert
        assertThrows(
                Exception.class,
                () -> jwtService.getExpirationDateFromToken(
                        invalidToken
                )
        );
    }


    @Test
    void validateToken_shouldThrowException_whenTokenIsInvalid() {

        // Arrange
        String invalidToken =
                "invalid.jwt.token";

        UserResponse userResponse =
                mock(UserResponse.class);

        when(userResponse.email())
                .thenReturn("test@example.com");

        // Act & Assert
        assertThrows(
                Exception.class,
                () -> jwtService.validateToken(
                        invalidToken,
                        userResponse
                )
        );
    }


    // =========================================================
    // ADDITIONAL TOKEN TEST
    // =========================================================

    @Test
    void generateToken_shouldGenerateDifferentTokensForDifferentUsers() {

        // Arrange
        String firstUsername =
                "user1@example.com";

        String secondUsername =
                "user2@example.com";

        // Act
        String firstToken =
                jwtService.generateToken(firstUsername);

        String secondToken =
                jwtService.generateToken(secondUsername);

        // Assert
        assertNotNull(firstToken);
        assertNotNull(secondToken);

        assertNotEquals(
                firstToken,
                secondToken
        );

        assertEquals(
                firstUsername,
                jwtService.getUsernameFromToken(firstToken)
        );

        assertEquals(
                secondUsername,
                jwtService.getUsernameFromToken(secondToken)
        );
    }
}