package com.capstone.team40.service;

import com.capstone.team40.entity.Booking;
import com.capstone.team40.entity.Hotel;
import com.capstone.team40.model.*;
import com.capstone.team40.entity.Room;
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

    public List<HotelResponse> getAllHotels()
    {
        return ConvertUtils.toHotelResponse(this.hotelRepository.findAll());
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

    public Hotel createHotel(CreateHotelRequest createHotelRequest)
    {
        return this.hotelRepository.save(ConvertUtils.toHotel(createHotelRequest));
    }

    public Hotel updateHotel(UpdateHotelRequest updateHotelRequest, UUID id)
    {
        Hotel hotelToUpdate = this.hotelRepository.findById(id).orElse(null);
        if(hotelToUpdate != null)
        {
            hotelToUpdate.setName(updateHotelRequest.name());
            hotelToUpdate.setCity(updateHotelRequest.city());
            hotelToUpdate.setDescription(updateHotelRequest.description());
            hotelToUpdate.setCoverImageUrl(updateHotelRequest.coverImageUrl());
            hotelToUpdate = this.hotelRepository.save(hotelToUpdate);
        }
        return hotelToUpdate;
    }

    public void deleteHotel(UUID id)
    {
        this.hotelRepository.deleteById(id);
    }

    public Room createRoomInHotel(UUID id, CreateRoomRequest createRoomRequest)
    {
        Hotel hotel = this.hotelRepository.findById(id).orElse(null);
        Room room = null;
        if(hotel != null)
        {
            room = new Room();
            room.setCreatedAt(LocalDateTime.now());
            room.setHotelId(id);
            room.setRoomNumber(createRoomRequest.roomNumber());
            room.setRoomType(createRoomRequest.roomType());
            room.setMaxOccupancy(createRoomRequest.maxOccupancy());
            room.setPricePerNight(createRoomRequest.pricePerNight());
            room.setActive(true);
            room = this.roomService.addRoom(room);
        }
        return room;
    }
}
