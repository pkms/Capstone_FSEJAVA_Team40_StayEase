package com.capstone.team40.service;

import com.capstone.team40.entity.Room;
import com.capstone.team40.enums.RoomType;
import com.capstone.team40.model.UpdateRoomRequest;
import com.capstone.team40.repository.RoomRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UpdateRoomRequest updateRoomRequest;

    @Mock
    private Room room;

    @InjectMocks
    private RoomService roomService;


    // =========================================================
    // findActiveRoomsInHotel() TESTS
    // =========================================================

    @Test
    void findActiveRoomsInHotel_shouldReturnActiveRooms() {

        // Arrange
        UUID hotelId = UUID.randomUUID();

        List<Room> expectedRooms = List.of(room);

        when(roomRepository.findByHotelIdAndActive(hotelId, true))
                .thenReturn(expectedRooms);

        // Act
        List<Room> result =
                roomService.findActiveRoomsInHotel(hotelId);

        // Assert
        assertNotNull(result);
        assertEquals(expectedRooms, result);
        assertEquals(1, result.size());

        verify(roomRepository)
                .findByHotelIdAndActive(hotelId, true);
    }


    @Test
    void findActiveRoomsInHotel_shouldReturnEmptyList_whenNoActiveRoomsExist() {

        // Arrange
        UUID hotelId = UUID.randomUUID();

        when(roomRepository.findByHotelIdAndActive(hotelId, true))
                .thenReturn(Collections.emptyList());

        // Act
        List<Room> result =
                roomService.findActiveRoomsInHotel(hotelId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(roomRepository)
                .findByHotelIdAndActive(hotelId, true);
    }


    // =========================================================
    // findByRoomIds() TESTS
    // =========================================================

    @Test
    void findByRoomIds_shouldReturnRooms() {

        // Arrange
        UUID roomId1 = UUID.randomUUID();
        UUID roomId2 = UUID.randomUUID();

        Set<UUID> roomIds = Set.of(roomId1, roomId2);

        Room room2 = mock(Room.class);

        List<Room> expectedRooms =
                List.of(room, room2);

        when(roomRepository.findByIdIn(roomIds))
                .thenReturn(expectedRooms);

        // Act
        List<Room> result =
                roomService.findByRoomIds(roomIds);

        // Assert
        assertNotNull(result);
        assertEquals(expectedRooms, result);
        assertEquals(2, result.size());

        verify(roomRepository)
                .findByIdIn(roomIds);
    }


    @Test
    void findByRoomIds_shouldReturnEmptyList_whenNoRoomsFound() {

        // Arrange
        Set<UUID> roomIds =
                Set.of(UUID.randomUUID());

        when(roomRepository.findByIdIn(roomIds))
                .thenReturn(Collections.emptyList());

        // Act
        List<Room> result =
                roomService.findByRoomIds(roomIds);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(roomRepository)
                .findByIdIn(roomIds);
    }


    // =========================================================
    // findByRoomId() TESTS
    // =========================================================

    @Test
    void findByRoomId_shouldReturnRoom_whenRoomExists() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.of(room));

        // Act
        Room result =
                roomService.findByRoomId(roomId);

        // Assert
        assertNotNull(result);
        assertEquals(room, result);

        verify(roomRepository)
                .findById(roomId);
    }


    @Test
    void findByRoomId_shouldReturnNull_whenRoomDoesNotExist() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.empty());

        // Act
        Room result =
                roomService.findByRoomId(roomId);

        // Assert
        assertNull(result);

        verify(roomRepository)
                .findById(roomId);
    }


    // =========================================================
    // addRoom() TESTS
    // =========================================================

    @Test
    void addRoom_shouldSaveAndReturnRoom() {

        // Arrange
        Room savedRoom = mock(Room.class);

        when(roomRepository.save(room))
                .thenReturn(savedRoom);

        // Act
        Room result =
                roomService.addRoom(room);

        // Assert
        assertNotNull(result);
        assertEquals(savedRoom, result);

        verify(roomRepository)
                .save(room);
    }


    // =========================================================
    // updateRoom() TESTS
    // =========================================================

    @Test
    void updateRoom_shouldUpdateAndReturnRoom_whenRoomExists() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.of(room));

        when(updateRoomRequest.roomType())
                .thenReturn(RoomType.Single);

        when(updateRoomRequest.pricePerNight())
                .thenReturn(5000.0);

        when(updateRoomRequest.maxOccupancy())
                .thenReturn(3);

        when(roomRepository.save(room))
                .thenReturn(room);

        // Act
        Room result =
                roomService.updateRoom(
                        updateRoomRequest,
                        roomId);

        // Assert
        assertNotNull(result);
        assertEquals(room, result);

        verify(roomRepository)
                .findById(roomId);

        verify(room)
                .setRoomType(RoomType.Single);

        verify(room)
                .setPricePerNight(5000.0);

        verify(room)
                .setMaxOccupancy(3);

        verify(roomRepository)
                .save(room);
    }


    @Test
    void updateRoom_shouldReturnNull_whenRoomDoesNotExist() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.empty());

        // Act
        Room result =
                roomService.updateRoom(
                        updateRoomRequest,
                        roomId);

        // Assert
        assertNull(result);

        verify(roomRepository)
                .findById(roomId);

        verify(roomRepository, never())
                .save(any(Room.class));

        verify(updateRoomRequest, never())
                .roomType();

        verify(updateRoomRequest, never())
                .pricePerNight();

        verify(updateRoomRequest, never())
                .maxOccupancy();
    }


    // =========================================================
    // deleteRoom() TEST
    // =========================================================

    @Test
    void deleteRoom_shouldDeleteRoomById() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        // Act
        roomService.deleteRoom(roomId);

        // Assert
        verify(roomRepository)
                .deleteById(roomId);
    }


    // =========================================================
    // toggleStatus() TESTS
    // =========================================================

    @Test
    void toggleStatus_shouldSetActiveTrue_whenRoomExists() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.of(room));

        when(roomRepository.save(room))
                .thenReturn(room);

        // Act
        Room result =
                roomService.toggleStatus(roomId, true);

        // Assert
        assertNotNull(result);
        assertEquals(room, result);

        verify(roomRepository)
                .findById(roomId);

        verify(room)
                .setActive(true);

        verify(roomRepository)
                .save(room);
    }


    @Test
    void toggleStatus_shouldSetActiveFalse_whenRoomExists() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.of(room));

        when(roomRepository.save(room))
                .thenReturn(room);

        // Act
        Room result =
                roomService.toggleStatus(roomId, false);

        // Assert
        assertNotNull(result);
        assertEquals(room, result);

        verify(roomRepository)
                .findById(roomId);

        verify(room)
                .setActive(false);

        verify(roomRepository)
                .save(room);
    }


    @Test
    void toggleStatus_shouldReturnNull_whenRoomDoesNotExist() {

        // Arrange
        UUID roomId = UUID.randomUUID();

        when(roomRepository.findById(roomId))
                .thenReturn(Optional.empty());

        // Act
        Room result =
                roomService.toggleStatus(roomId, true);

        // Assert
        assertNull(result);

        verify(roomRepository)
                .findById(roomId);

        verify(roomRepository, never())
                .save(any(Room.class));

        verify(room, never())
                .setActive(anyBoolean());
    }
}