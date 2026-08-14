package com.capstone.team40.controller;

import com.capstone.team40.model.CreateBookingRequest;
import com.capstone.team40.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/bookings")
public class BookingController
{
    @Autowired
    private BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<UUID> createBooking(@RequestBody CreateBookingRequest createBookingRequest)
    {
        return ResponseEntity.ok().body(this.bookingService.createBooking(createBookingRequest));
    }
}
