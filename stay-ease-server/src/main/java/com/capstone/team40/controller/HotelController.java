package com.capstone.team40.controller;

import com.capstone.team40.model.HotelResponse;
import com.capstone.team40.model.RoomResponse;
import com.capstone.team40.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/hotels")
public class HotelController
{
    @Autowired
    private HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getHotels(@RequestParam("city") String city)
    {
        return ResponseEntity.ok().body(this.hotelService.forCity(city));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(@PathVariable("id") UUID id,
                                                                @RequestParam("checkInDate") LocalDateTime checkInDate,
                                                                @RequestParam("checkOutDate") LocalDateTime checkOutDate)
    {
        return ResponseEntity.ok().body(this.hotelService.getAvailableRooms(id, checkInDate, checkOutDate));
    }
}
