package com.capstone.team40.service;

import com.capstone.team40.model.Booking;
import com.capstone.team40.model.HotelResponse;
import com.capstone.team40.model.Room;
import com.capstone.team40.model.RoomResponse;
import com.capstone.team40.repository.HotelRepository;
import com.capstone.team40.utils.ConvertUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class HotelService
{
    @Autowired
    private HotelRepository hotelRepository;
    @Autowired
    private RoomService roomService;
    @Autowired
    private BookingService bookingService;

    public List<HotelResponse> forCity(String city)
    {
        return ConvertUtils.toHotelResponse(this.hotelRepository.findByCity(city));
    }

    public List<RoomResponse> getAvailableRooms(UUID id, LocalDateTime checkInDate, LocalDateTime checkOutDate)
    {
        List<Room> activeRooms = this.roomService.findActiveRoomsInHotel(id);
        Map<UUID, Room> roomIdAndRoomMap = activeRooms.stream().collect(Collectors.toMap(Room::getId, Function.identity()));

        Map<UUID,List<Booking>> bookingsPerRoom = this.bookingService.getBookingDetails(roomIdAndRoomMap.keySet())
                .stream().collect(Collectors.groupingBy(Booking::getRoomId));

        List<Room> availableRooms = roomIdAndRoomMap.entrySet().stream().filter(uuidRoomEntry -> !(bookingsPerRoom.containsKey(uuidRoomEntry.getKey()))
                || bookingsPerRoom.get(uuidRoomEntry.getKey()).stream().filter(booking -> (checkInDate.isAfter(booking.getCheckInDate()) &&
                checkInDate.isBefore(booking.getCheckOutDate())) || (checkOutDate.isAfter(booking.getCheckInDate()) &&
                checkOutDate.isBefore(booking.getCheckOutDate()))).findFirst().isEmpty())
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());

        return ConvertUtils.toRoomResponse(availableRooms);
    }
}
