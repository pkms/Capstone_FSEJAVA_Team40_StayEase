package com.capstone.team40.controller;

import com.capstone.team40.annotation.ValidLocalDateTime;
import com.capstone.team40.entity.Hotel;
import com.capstone.team40.entity.Room;
import com.capstone.team40.model.*;
import com.capstone.team40.service.HotelService;
import com.capstone.team40.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getHotels(@RequestParam("city") @Valid @NotBlank String city)
    {
        return ResponseEntity.ok().body(this.hotelService.forCity(city));
    }

    @GetMapping("/all")
    public ResponseEntity<List<HotelResponse>> getAllHotels()
    {
        return ResponseEntity.ok().body(this.hotelService.getAllHotels());
    }

    @GetMapping("/{id}/availableRooms")
    public ResponseEntity<?> getAvailableRooms(@PathVariable("id") UUID id,
                                               @RequestParam("checkInDate") @Valid @ValidLocalDateTime LocalDateTime checkInDate,
                                               @RequestParam("checkOutDate") @Valid @ValidLocalDateTime LocalDateTime checkOutDate)
    {
        if(checkInDate.plusDays(1).isAfter(checkOutDate))
        {
            return ResponseEntity.badRequest().body("Booking for minimum 1 Day is must. Please select Check In and Check Out Date accordingly.");
        }
        return ResponseEntity.ok().body(this.hotelService.getAvailableRooms(id, checkInDate, checkOutDate));
    }

    @PostMapping("/create")
    public ResponseEntity<String> createHotel(@RequestBody @Valid CreateHotelRequest createHotelRequest)
    {
        if(!this.userService.isUserExists(createHotelRequest.managerId()))
        {
            return ResponseEntity.badRequest().body("Manager with provided ID does not exists in the System.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body("Hotel successfully created with ID - " +this.hotelService.createHotel(createHotelRequest).getId());
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<String> updateHotel(@RequestBody @Valid UpdateHotelRequest updateHotelRequest, @PathVariable("id") UUID id)
    {
        Hotel updatedHotel = this.hotelService.updateHotel(updateHotelRequest, id);
        return updatedHotel == null ? ResponseEntity.badRequest().body("Hotel with given Id does not exists !") : ResponseEntity.ok().body("Hotel details updated successfully !");
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<String> deleteHotel(@PathVariable("id") UUID id)
    {
        this.hotelService.deleteHotel(id);
        return ResponseEntity.ok().body("Hotel deleted successfully !");
    }

    @PostMapping("/{id}/createRoom")
    public ResponseEntity<String> createHotelRoom(@PathVariable("id") UUID id, @RequestBody CreateRoomRequest createRoomRequest)
    {
        Room room = this.hotelService.createRoomInHotel(id, createRoomRequest);
        return room == null ? ResponseEntity.badRequest().body("Hotel with given Id does not exists !") : ResponseEntity.ok().body("Room successfully added in Hotel and Room ID is - "+room.getId());
    }

}
