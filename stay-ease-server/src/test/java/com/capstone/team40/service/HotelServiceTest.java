package com.capstone.team40.service;

import com.capstone.team40.entity.Booking;
import com.capstone.team40.entity.Hotel;
import com.capstone.team40.entity.Room;
import com.capstone.team40.enums.RoomType;
import com.capstone.team40.model.CreateHotelRequest;
import com.capstone.team40.model.CreateRoomRequest;
import com.capstone.team40.model.HotelResponse;
import com.capstone.team40.model.RoomResponse;
import com.capstone.team40.model.UpdateHotelRequest;
import com.capstone.team40.repository.HotelRepository;
import com.capstone.team40.utils.ConvertUtils;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

	@Mock
	private HotelRepository hotelRepository;

	@Mock
	private RoomService roomService;

	@Mock
	private BookingService bookingService;

	@Mock
	private CreateHotelRequest createHotelRequest;

	@Mock
	private CreateRoomRequest createRoomRequest;

	@Mock
	private UpdateHotelRequest updateHotelRequest;

	@Mock
	private Hotel hotel;

	@Mock
	private Room room;

	@Mock
	private HotelResponse hotelResponse;

	@Mock
	private RoomResponse roomResponse;

	@InjectMocks
	private HotelService hotelService;

	// =========================================================
	// forCity() TESTS
	// =========================================================

	@Test
	void forCity_shouldReturnHotelsForGivenCity() {

		// Arrange
		String city = "Hyderabad";

		List<Hotel> hotels = List.of(hotel);
		List<HotelResponse> expectedResponse = List.of(hotelResponse);

		when(hotelRepository.findByCity(city)).thenReturn(hotels);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toHotelResponse(hotels)).thenReturn(expectedResponse);

			// Act
			List<HotelResponse> result = hotelService.forCity(city);

			// Assert
			assertNotNull(result);
			assertEquals(expectedResponse, result);

			verify(hotelRepository).findByCity(city);

			mockedConvertUtils.verify(() -> ConvertUtils.toHotelResponse(hotels));
		}
	}

	@Test
	void forCity_shouldReturnEmptyList_whenNoHotelsFound() {

		// Arrange
		String city = "Hyderabad";

		List<Hotel> hotels = Collections.emptyList();

		when(hotelRepository.findByCity(city)).thenReturn(hotels);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toHotelResponse(hotels)).thenReturn(Collections.emptyList());

			// Act
			List<HotelResponse> result = hotelService.forCity(city);

			// Assert
			assertNotNull(result);
			assertTrue(result.isEmpty());

			verify(hotelRepository).findByCity(city);
		}
	}

	// =========================================================
	// getAllHotels() TESTS
	// =========================================================

	@Test
	void getAllHotels_shouldReturnAllHotels() {

		// Arrange
		List<Hotel> hotels = List.of(hotel);
		List<HotelResponse> expectedResponse = List.of(hotelResponse);

		when(hotelRepository.findAll()).thenReturn(hotels);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toHotelResponse(hotels)).thenReturn(expectedResponse);

			// Act
			List<HotelResponse> result = hotelService.getAllHotels();

			// Assert
			assertNotNull(result);
			assertEquals(expectedResponse, result);

			verify(hotelRepository).findAll();

			mockedConvertUtils.verify(() -> ConvertUtils.toHotelResponse(hotels));
		}
	}

	@Test
	void getAllHotels_shouldReturnEmptyList_whenNoHotelsExist() {

		// Arrange
		List<Hotel> hotels = Collections.emptyList();

		when(hotelRepository.findAll()).thenReturn(hotels);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toHotelResponse(hotels)).thenReturn(Collections.emptyList());

			// Act
			List<HotelResponse> result = hotelService.getAllHotels();

			// Assert
			assertNotNull(result);
			assertTrue(result.isEmpty());

			verify(hotelRepository).findAll();
		}
	}

	// =========================================================
	// getAvailableRooms() TESTS
	// =========================================================

	@Test
	void getAvailableRooms_shouldReturnAllRooms_whenNoBookingsExist() {

		// Arrange
		UUID hotelId = UUID.randomUUID();
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 9, 1, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 9, 5, 10, 0);

		when(room.getId()).thenReturn(roomId);

		when(roomService.findActiveRoomsInHotel(hotelId)).thenReturn(List.of(room));

		when(bookingService.getBookingDetails(Set.of(roomId))).thenReturn(Collections.emptyList());

		List<RoomResponse> expectedResponse = List.of(roomResponse);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toRoomResponse(List.of(room))).thenReturn(expectedResponse);

			// Act
			List<RoomResponse> result = hotelService.getAvailableRooms(hotelId, checkIn, checkOut);

			// Assert
			assertNotNull(result);
			assertEquals(expectedResponse, result);

			verify(roomService).findActiveRoomsInHotel(hotelId);

			verify(bookingService).getBookingDetails(Set.of(roomId));
		}
	}

	@Test
	void getAvailableRooms_shouldReturnEmptyList_whenNoActiveRoomsExist() {

		// Arrange
		UUID hotelId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 9, 1, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 9, 5, 10, 0);

		when(roomService.findActiveRoomsInHotel(hotelId)).thenReturn(Collections.emptyList());

		when(bookingService.getBookingDetails(Collections.emptySet())).thenReturn(Collections.emptyList());

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toRoomResponse(Collections.emptyList()))
					.thenReturn(Collections.emptyList());

			// Act
			List<RoomResponse> result = hotelService.getAvailableRooms(hotelId, checkIn, checkOut);

			// Assert
			assertNotNull(result);
			assertTrue(result.isEmpty());

			verify(roomService).findActiveRoomsInHotel(hotelId);

			verify(bookingService).getBookingDetails(Collections.emptySet());
		}
	}

	@Test
	void getAvailableRooms_shouldExcludeRoom_whenBookingOverlapsCheckInDate() {

		// Arrange
		UUID hotelId = UUID.randomUUID();
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 9, 5, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 9, 10, 10, 0);

		Booking existingBooking = mock(Booking.class);

		when(room.getId()).thenReturn(roomId);

		when(existingBooking.getRoomId()).thenReturn(roomId);

		when(existingBooking.getCheckInDate()).thenReturn(LocalDateTime.of(2026, 9, 1, 10, 0));

		when(existingBooking.getCheckOutDate()).thenReturn(LocalDateTime.of(2026, 9, 8, 10, 0));

		when(roomService.findActiveRoomsInHotel(hotelId)).thenReturn(List.of(room));

		when(bookingService.getBookingDetails(Set.of(roomId))).thenReturn(List.of(existingBooking));

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toRoomResponse(Collections.emptyList()))
					.thenReturn(Collections.emptyList());

			// Act
			List<RoomResponse> result = hotelService.getAvailableRooms(hotelId, checkIn, checkOut);

			// Assert
			assertNotNull(result);
			assertTrue(result.isEmpty());

			verify(roomService).findActiveRoomsInHotel(hotelId);

			verify(bookingService).getBookingDetails(Set.of(roomId));
		}
	}

	@Test
	void getAvailableRooms_shouldReturnRoom_whenBookingIsOutsideRequestedDates() {

		// Arrange
		UUID hotelId = UUID.randomUUID();
		UUID roomId = UUID.randomUUID();

		LocalDateTime checkIn = LocalDateTime.of(2026, 9, 10, 10, 0);

		LocalDateTime checkOut = LocalDateTime.of(2026, 9, 15, 10, 0);

		Booking existingBooking = mock(Booking.class);

		when(room.getId()).thenReturn(roomId);

		when(existingBooking.getRoomId()).thenReturn(roomId);

		when(existingBooking.getCheckInDate()).thenReturn(LocalDateTime.of(2026, 9, 1, 10, 0));

		when(existingBooking.getCheckOutDate()).thenReturn(LocalDateTime.of(2026, 9, 5, 10, 0));

		when(roomService.findActiveRoomsInHotel(hotelId)).thenReturn(List.of(room));

		when(bookingService.getBookingDetails(Set.of(roomId))).thenReturn(List.of(existingBooking));

		List<RoomResponse> expectedResponse = List.of(roomResponse);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toRoomResponse(List.of(room))).thenReturn(expectedResponse);

			// Act
			List<RoomResponse> result = hotelService.getAvailableRooms(hotelId, checkIn, checkOut);

			// Assert
			assertNotNull(result);
			assertEquals(1, result.size());
			assertEquals(roomResponse, result.get(0));

			verify(roomService).findActiveRoomsInHotel(hotelId);

			verify(bookingService).getBookingDetails(Set.of(roomId));
		}
	}

	// =========================================================
	// createHotel() TESTS
	// =========================================================

	@Test
	void createHotel_shouldSaveAndReturnHotel() {

		// Arrange
		Hotel convertedHotel = mock(Hotel.class);

		when(hotelRepository.save(convertedHotel)).thenReturn(hotel);

		try (MockedStatic<ConvertUtils> mockedConvertUtils = mockStatic(ConvertUtils.class)) {

			mockedConvertUtils.when(() -> ConvertUtils.toHotel(createHotelRequest)).thenReturn(convertedHotel);

			// Act
			Hotel result = hotelService.createHotel(createHotelRequest);

			// Assert
			assertNotNull(result);
			assertEquals(hotel, result);

			verify(hotelRepository).save(convertedHotel);

			mockedConvertUtils.verify(() -> ConvertUtils.toHotel(createHotelRequest));
		}
	}

	// =========================================================
	// updateHotel() TESTS
	// =========================================================

	@Test
	void updateHotel_shouldUpdateAndReturnHotel_whenHotelExists() {

		// Arrange
		UUID hotelId = UUID.randomUUID();

		when(hotelRepository.findById(hotelId)).thenReturn(Optional.of(hotel));

		when(updateHotelRequest.name()).thenReturn("Updated Hotel");

		when(updateHotelRequest.city()).thenReturn("Hyderabad");

		when(updateHotelRequest.description()).thenReturn("Updated description");

		when(updateHotelRequest.coverImageUrl()).thenReturn("image.jpg");

		when(hotelRepository.save(hotel)).thenReturn(hotel);

		// Act
		Hotel result = hotelService.updateHotel(updateHotelRequest, hotelId);

		// Assert
		assertNotNull(result);
		assertEquals(hotel, result);

		verify(hotel).setName("Updated Hotel");

		verify(hotel).setCity("Hyderabad");

		verify(hotel).setDescription("Updated description");

		verify(hotel).setCoverImageUrl("image.jpg");

		verify(hotelRepository).save(hotel);
	}

	@Test
	void updateHotel_shouldReturnNull_whenHotelDoesNotExist() {

		// Arrange
		UUID hotelId = UUID.randomUUID();

		when(hotelRepository.findById(hotelId)).thenReturn(Optional.empty());

		// Act
		Hotel result = hotelService.updateHotel(updateHotelRequest, hotelId);

		// Assert
		assertNull(result);

		verify(hotelRepository).findById(hotelId);

		verify(hotelRepository, never()).save(any());
	}

	// =========================================================
	// deleteHotel() TESTS
	// =========================================================

	@Test
	void deleteHotel_shouldDeleteHotelById() {

		// Arrange
		UUID hotelId = UUID.randomUUID();

		// Act
		hotelService.deleteHotel(hotelId);

		// Assert
		verify(hotelRepository).deleteById(hotelId);
	}

	// =========================================================
	// createRoomInHotel() TESTS
	// =========================================================

	@Test
	void createRoomInHotel_shouldCreateRoom_whenHotelExists() {

		// Arrange
		UUID hotelId = UUID.randomUUID();

		when(hotelRepository.findById(hotelId)).thenReturn(Optional.of(hotel));

		when(createRoomRequest.roomNumber()).thenReturn(101);

		/*
		 * roomType() returns RoomType, not String. Change DELUXE if your enum uses a
		 * different value.
		 */
		when(createRoomRequest.roomType()).thenReturn(RoomType.Single);

		/*
		 * maxOccupancy() returns Integer, so 3 is correct.
		 */
		when(createRoomRequest.maxOccupancy()).thenReturn(3);

		when(createRoomRequest.pricePerNight()).thenReturn(5000.0);

		when(roomService.addRoom(any(Room.class))).thenReturn(room);

		// Act
		Room result = hotelService.createRoomInHotel(hotelId, createRoomRequest);

		// Assert
		assertNotNull(result);
		assertEquals(room, result);

		verify(hotelRepository).findById(hotelId);

		verify(roomService).addRoom(any(Room.class));
	}

	@Test
	void createRoomInHotel_shouldReturnNull_whenHotelDoesNotExist() {

		// Arrange
		UUID hotelId = UUID.randomUUID();

		when(hotelRepository.findById(hotelId)).thenReturn(Optional.empty());

		// Act
		Room result = hotelService.createRoomInHotel(hotelId, createRoomRequest);

		// Assert
		assertNull(result);

		verify(hotelRepository).findById(hotelId);

		verify(roomService, never()).addRoom(any(Room.class));
	}
}