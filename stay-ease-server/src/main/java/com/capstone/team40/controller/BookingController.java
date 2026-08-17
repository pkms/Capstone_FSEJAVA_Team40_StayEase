package com.capstone.team40.controller;

import com.capstone.team40.entity.Booking;
import com.capstone.team40.model.BookingResponse;
import com.capstone.team40.model.CreateBookingRequest;
import com.capstone.team40.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping("/mine")
    public ResponseEntity<List<BookingResponse>> mineBookings()
    {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok().body(this.bookingService.forLoggedInUser(userName));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelBooking(@RequestParam("id") UUID bookingId)
    {
        Booking booking = this.bookingService.cancelBooking(bookingId);
        return booking != null ? ResponseEntity.ok().body("Booking cancelled successfully.") :
                ResponseEntity.badRequest().body("Booking does not exists !");
    }

}
