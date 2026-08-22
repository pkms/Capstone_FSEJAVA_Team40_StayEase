package com.capstone.team40.service;

import com.capstone.team40.entity.Booking;
import com.capstone.team40.entity.Hotel;
import com.capstone.team40.entity.Room;
import com.capstone.team40.enums.BookingStatus;
import com.capstone.team40.model.BookingResponse;
import com.capstone.team40.model.CreateBookingRequest;
import com.capstone.team40.repository.BookingRepository;
import com.capstone.team40.repository.HotelRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.apache.coyote.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

	@Mock
	private BookingRepository bookingRepository;

	@Mock
	private RoomService roomService;

	@Mock
	private HotelRepository hotelRepository;

	@Mock
	private CreateBookingRequest createBookingRequest;

	@Mock
	private Booking booking;

	@Mock
	private Room room;

	@Mock
	private BookingResponse bookingResponse;

	@InjectMocks
	private BookingService bookingService;

	// =========================================================
	// getBookingDetails() TESTS
	// =========================================================

	@Test
	void getBookingDetails_shouldReturnOnlyCompletedBookings() {

		// Arrange
		UUID roomId = UUID.randomUUID();

		Booking completedBooking = mock(Booking.class);
		Booking cancelledBooking = mock(Booking.class);

		when(completedBooking.getBookingStatus()).thenReturn(BookingStatus.COMPLETED);

		when(cancelledBooking.getBookingStatus()).thenReturn(BookingStatus.CANCELLED);

		Set<UUID> roomIds = Set.of(roomId);

		when(bookingRepository.findByRoomIdIn(roomIds)).thenReturn(List.of(completedBooking, cancelledBooking));

		// Act
		List<Booking> result = bookingService.getBookingDetails(roomIds);

		// Assert
		assertNotNull(result);
		assertEquals(1, result.size());
		assertTrue(result.contains(completedBooking));
		assertFalse(result.contains(cancelledBooking));

		verify(bookingRepository).findByRoomIdIn(roomIds);
	}

	@Test
	void getBookingDetails_shouldReturnEmptyList_whenNoCompletedBookingsExist() {

		// Arrange
		UUID roomId = UUID.randomUUID();

		Booking cancelledBooking = mock(Booking.class);

		when(cancelledBooking.getBookingStatus()).thenReturn(BookingStatus.CANCELLED);

		Set<UUID> roomIds = Set.of(roomId);

		when(bookingRepository.findByRoomIdIn(roomIds)).thenReturn(List.of(cancelledBooking));

		// Act
		List<Booking> result = bookingService.getBookingDetails(roomIds);

		// Assert
		assertNotNull(result);
		assertTrue(result.isEmpty());

		verify(bookingRepository).findByRoomIdIn(roomIds);
	}

	// =========================================================
	// isRoomAvailable() TESTS
	// =========================================================

	@Test
	void isRoomAvailable_shouldReturnTrue_whenNoBookingExists() {

		// Arrange
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 8, 25, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 8, 27, 10, 0);

		when(bookingRepository.findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkIn, checkOut))
				.thenReturn(Collections.emptyList());

		// Act
		boolean result = bookingService.isRoomAvailable(roomId, checkIn, checkOut);

		// Assert
		assertTrue(result);

		verify(bookingRepository).findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkIn, checkOut);
	}

	@Test
	void isRoomAvailable_shouldReturnFalse_whenBookingExists() {

		// Arrange
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 8, 25, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 8, 27, 10, 0);

		when(bookingRepository.findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkIn, checkOut))
				.thenReturn(List.of(booking));

		// Act
		boolean result = bookingService.isRoomAvailable(roomId, checkIn, checkOut);

		// Assert
		assertFalse(result);

		verify(bookingRepository).findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkIn, checkOut);
	}

	// =========================================================
	// createBooking() TESTS
	// =========================================================

	@Test
	void createBooking_shouldThrowException_whenBookingIsLessThanOneDay() throws BadRequestException {

		// Arrange
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 8, 25, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 8, 25, 20, 0);

		when(createBookingRequest.checkInDate()).thenReturn(checkIn);

		when(createBookingRequest.checkOutDate()).thenReturn(checkOut);

		// Act & Assert
		BadRequestException exception = assertThrows(BadRequestException.class,
				() -> bookingService.createBooking(createBookingRequest));

		assertEquals("Booking for minimum 1 Day is must. Please select Check In and Check Out Date accordingly.",
				exception.getMessage());

		verify(roomService, never()).findByRoomId(any());

		verify(bookingRepository, never()).save(any());
	}

	@Test
	void createBooking_shouldThrowException_whenRoomDoesNotExist() throws BadRequestException {

		// Arrange
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 8, 25, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 8, 26, 10, 0);

		when(createBookingRequest.roomId()).thenReturn(roomId);

		when(createBookingRequest.checkInDate()).thenReturn(checkIn);

		when(createBookingRequest.checkOutDate()).thenReturn(checkOut);

		when(roomService.findByRoomId(roomId)).thenReturn(null);

		// Act & Assert
		BadRequestException exception = assertThrows(BadRequestException.class,
				() -> bookingService.createBooking(createBookingRequest));

		assertEquals("Room with provided Room ID is not yet created in the System.", exception.getMessage());

		verify(roomService).findByRoomId(roomId);

		verify(bookingRepository, never()).save(any());
	}

	@Test
	void createBooking_shouldThrowException_whenRoomIsAlreadyBooked() throws BadRequestException {

		// Arrange
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 8, 25, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 8, 26, 10, 0);

		when(createBookingRequest.roomId()).thenReturn(roomId);

		when(createBookingRequest.checkInDate()).thenReturn(checkIn);

		when(createBookingRequest.checkOutDate()).thenReturn(checkOut);

		when(roomService.findByRoomId(roomId)).thenReturn(room);

		when(bookingRepository.findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkIn, checkOut))
				.thenReturn(List.of(booking));

		// Act & Assert
		BadRequestException exception = assertThrows(BadRequestException.class,
				() -> bookingService.createBooking(createBookingRequest));

		assertEquals("Room with provided Room ID is already booked on the provided Check In and Check Out Date.",
				exception.getMessage());

		verify(roomService).findByRoomId(roomId);

		verify(bookingRepository).findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkIn, checkOut);

		verify(bookingRepository, never()).save(any());
	}

	@Test
	void createBooking_shouldCreateBookingSuccessfully() throws BadRequestException {

		// Arrange
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 8, 25, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 8, 26, 10, 0);

		String userName = "testUser";

		when(createBookingRequest.roomId()).thenReturn(roomId);

		when(createBookingRequest.checkInDate()).thenReturn(checkIn);

		when(createBookingRequest.checkOutDate()).thenReturn(checkOut);

		when(roomService.findByRoomId(roomId)).thenReturn(room);

		when(bookingRepository.findByRoomIdAndCheckInDateAndCheckOutDate(roomId, checkIn, checkOut))
				.thenReturn(Collections.emptyList());

		Booking convertedBooking = mock(Booking.class);

		when(bookingRepository.save(convertedBooking)).thenReturn(convertedBooking);

		// Set Security Context
		SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(userName, null));

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toBooking(createBookingRequest)).thenReturn(convertedBooking);

			// Act
			Booking result = bookingService.createBooking(createBookingRequest);

			// Assert
			assertNotNull(result);
			assertEquals(convertedBooking, result);

			verify(convertedBooking).setBookingStatus(BookingStatus.COMPLETED);

			verify(convertedBooking).setCreatedBy(userName);

			verify(bookingRepository).save(convertedBooking);

			mockedConvertUtils.verify(() -> ConvertUtils.toBooking(createBookingRequest));
		}

		// Clean SecurityContext after test
		SecurityContextHolder.clearContext();
	}

	// =========================================================
	// forLoggedInUser() TESTS
	// =========================================================

	@Test
	void forLoggedInUser_shouldReturnBookingResponses() {

		// Arrange
		String loggedInUser = "testUser";

		UUID roomId = UUID.randomUUID();

		UUID hotelId = UUID.randomUUID();

		Booking booking1 = mock(Booking.class);

		when(booking1.getRoomId()).thenReturn(roomId);

		when(bookingRepository.findByCreatedBy(loggedInUser)).thenReturn(List.of(booking1));

		Room room = mock(Room.class);
		Hotel hotel = mock(Hotel.class);

		when(room.getId()).thenReturn(roomId);
		when(room.getHotelId()).thenReturn(hotelId);
		when(hotel.getId()).thenReturn(hotelId);

		when(roomService.findByRoomIds(Set.of(roomId))).thenReturn(List.of(room));
		when(hotelRepository.findAllById(Set.of(hotelId))).thenReturn(List.of(hotel));

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toBookingResponse(booking1, hotel, room)).thenReturn(bookingResponse);

			// Act
			List<BookingResponse> result = bookingService.forLoggedInUser(loggedInUser);

			// Assert
			assertNotNull(result);
			assertEquals(1, result.size());
			assertEquals(bookingResponse, result.get(0));

			verify(bookingRepository).findByCreatedBy(loggedInUser);

			verify(roomService).findByRoomIds(Set.of(roomId));

			verify(hotelRepository).findAllById(Set.of(hotelId));

			mockedConvertUtils.verify(() -> ConvertUtils.toBookingResponse(booking1, hotel, room));
		}
	}

	@Test
	void forLoggedInUser_shouldReturnEmptyList_whenUserHasNoBookings() {

		// Arrange
		String loggedInUser = "testUser";

		when(bookingRepository.findByCreatedBy(loggedInUser)).thenReturn(Collections.emptyList());

		when(roomService.findByRoomIds(Collections.emptySet())).thenReturn(Collections.emptyList());

		// Act
		List<BookingResponse> result = bookingService.forLoggedInUser(loggedInUser);

		// Assert
		assertNotNull(result);
		assertTrue(result.isEmpty());

		verify(bookingRepository).findByCreatedBy(loggedInUser);

		verify(roomService).findByRoomIds(Collections.emptySet());
	}

	// =========================================================
	// cancelBooking() TESTS
	// =========================================================

	@Test
	void cancelBooking_shouldCancelAndSaveBooking_whenBookingExists() {

		// Arrange
		UUID bookingId = UUID.randomUUID();

		String userName = "testUser";

		when(bookingRepository.findByIdAndCreatedBy(bookingId, userName)).thenReturn(booking);

		// Act
		Booking result = bookingService.cancelBooking(bookingId, userName);

		// Assert
		assertNotNull(result);
		assertEquals(booking, result);

		verify(booking).setBookingStatus(BookingStatus.CANCELLED);

		verify(bookingRepository).save(booking);

		verify(bookingRepository).findByIdAndCreatedBy(bookingId, userName);
	}

	@Test
	void cancelBooking_shouldReturnNull_whenBookingDoesNotExist() {

		// Arrange
		UUID bookingId = UUID.randomUUID();

		String userName = "testUser";

		when(bookingRepository.findByIdAndCreatedBy(bookingId, userName)).thenReturn(null);

		// Act
		Booking result = bookingService.cancelBooking(bookingId, userName);

		// Assert
		assertNull(result);

		verify(bookingRepository).findByIdAndCreatedBy(bookingId, userName);

		verify(bookingRepository, never()).save(any());

		verify(booking, never()).setBookingStatus(any());
	}
}