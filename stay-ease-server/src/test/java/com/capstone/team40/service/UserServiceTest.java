package com.capstone.team40.service;

import com.capstone.team40.entity.User;
import com.capstone.team40.model.CreateUserRequest;
import com.capstone.team40.model.LoginRequest;
import com.capstone.team40.model.UserResponse;
import com.capstone.team40.repository.UserRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private CreateUserRequest createUserRequest;

	@Mock
	private LoginRequest loginRequest;

	@Mock
	private User user;

	@Mock
	private UserResponse userResponse;

	@InjectMocks
	private UserService userService;

	// =========================================================
	// registerUser() TESTS
	// =========================================================

	@Test
	void registerUser_shouldReturnFalse_whenUserAlreadyExists() {

		// Arrange
		when(createUserRequest.email()).thenReturn("test@gmail.com");

		when(userRepository.findByEmail("test@gmail.com")).thenReturn(user);

		// Act
		boolean result = userService.registerUser(createUserRequest);

		// Assert
		assertFalse(result);

		verify(userRepository).findByEmail("test@gmail.com");

		verify(userRepository, never()).save(any(User.class));
	}

	@Test
	void registerUser_shouldSaveUserAndReturnTrue_whenUserDoesNotExist() {

		// Arrange
		when(createUserRequest.email()).thenReturn("test@gmail.com");

		when(userRepository.findByEmail("test@gmail.com")).thenReturn(null);

		User convertedUser = mock(User.class);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toUser(createUserRequest, passwordEncoder))
					.thenReturn(convertedUser);

			// Act
			boolean result = userService.registerUser(createUserRequest);

			// Assert
			assertTrue(result);

			verify(userRepository).findByEmail("test@gmail.com");

			verify(userRepository).save(convertedUser);

			mockedConvertUtils.verify(() -> ConvertUtils.toUser(createUserRequest, passwordEncoder));
		}
	}

	// =========================================================
	// login() TESTS
	// =========================================================

	@Test
	void login_shouldReturnUserResponse_whenCredentialsAreValid() {

		// Arrange
		when(loginRequest.email()).thenReturn("test@gmail.com");

		when(loginRequest.password()).thenReturn("password");

		when(userRepository.findByEmail("test@gmail.com")).thenReturn(user);

		when(user.getPasswordHash()).thenReturn("encodedPassword");

		when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toUserResponse(user)).thenReturn(userResponse);

			// Act
			UserResponse result = userService.login(loginRequest);

			// Assert
			assertNotNull(result);
			assertEquals(userResponse, result);

			verify(userRepository).findByEmail("test@gmail.com");

			verify(passwordEncoder).matches("password", "encodedPassword");

			mockedConvertUtils.verify(() -> ConvertUtils.toUserResponse(user));
		}
	}

	@Test
	void login_shouldReturnNull_whenPasswordIsIncorrect() {

		// Arrange
		when(loginRequest.email()).thenReturn("test@gmail.com");

		when(loginRequest.password()).thenReturn("wrongPassword");

		when(userRepository.findByEmail("test@gmail.com")).thenReturn(user);

		when(user.getPasswordHash()).thenReturn("encodedPassword");

		when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

		// Act
		UserResponse result = userService.login(loginRequest);

		// Assert
		assertNull(result);

		verify(userRepository).findByEmail("test@gmail.com");

		verify(passwordEncoder).matches("wrongPassword", "encodedPassword");
	}

	@Test
	void login_shouldReturnNull_whenUserDoesNotExist() {

		// Arrange
		when(loginRequest.email()).thenReturn("unknown@gmail.com");

		when(loginRequest.password()).thenReturn("password");

		when(userRepository.findByEmail("unknown@gmail.com")).thenReturn(null);

		// Act
		UserResponse result = userService.login(loginRequest);

		// Assert
		assertNull(result);

		verify(userRepository).findByEmail("unknown@gmail.com");

		verify(passwordEncoder, never()).matches(anyString(), anyString());
	}

	// =========================================================
	// forEmailId() TESTS
	// =========================================================

	@Test
	void forEmailId_shouldReturnUserResponse_whenUserExists() {

		// Arrange
		String email = "test@gmail.com";

		when(userRepository.findByEmail(email)).thenReturn(user);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toUserResponse(user)).thenReturn(userResponse);

			// Act
			UserResponse result = userService.forEmailId(email);

			// Assert
			assertNotNull(result);
			assertEquals(userResponse, result);

			verify(userRepository).findByEmail(email);

			mockedConvertUtils.verify(() -> ConvertUtils.toUserResponse(user));
		}
	}

	@Test
	void forEmailId_shouldThrowException_whenUserDoesNotExist() {

		// Arrange
		String email = "unknown@gmail.com";

		when(userRepository.findByEmail(email)).thenReturn(null);

		// Act & Assert
		UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class,
				() -> userService.forEmailId(email));

		assertEquals("User name does not exists in the system !", exception.getMessage());

		verify(userRepository).findByEmail(email);
	}

	// =========================================================
	// isUserExists() TESTS
	// =========================================================

	@Test
	void isUserExists_shouldReturnTrue_whenUserExists() {

		// Arrange
		UUID uuid = UUID.randomUUID();

		when(userRepository.existsById(uuid)).thenReturn(true);

		// Act
		boolean result = userService.isUserExists(uuid);

		// Assert
		assertTrue(result);

		verify(userRepository).existsById(uuid);
	}

	@Test
	void isUserExists_shouldReturnFalse_whenUserDoesNotExist() {

		// Arrange
		UUID uuid = UUID.randomUUID();

		when(userRepository.existsById(uuid)).thenReturn(false);

		// Act
		boolean result = userService.isUserExists(uuid);

		// Assert
		assertFalse(result);

		verify(userRepository).existsById(uuid);
	}
}