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
    public ResponseEntity<String> createBooking(@RequestBody CreateBookingRequest createBookingRequest)
    {
        Booking booking = null;
        try
        {
            booking = this.bookingService.createBooking(createBookingRequest);
        }
        catch (Exception exception)
        {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
        return ResponseEntity.ok().body("Room successfully booked with Booking ID - " +booking.getId());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<BookingResponse>> mineBookings()
    {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok().body(this.bookingService.forLoggedInUser(userName));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable("id") UUID bookingId)
    {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking booking = this.bookingService.cancelBooking(bookingId, userName);
        return booking != null ? ResponseEntity.ok().body("Booking cancelled successfully.") :
                ResponseEntity.badRequest().body("Booking does not exists !");
    }

    @GetMapping("{days}/upcoming")
    public ResponseEntity<List<BookingResponse>> getUpcomingBookings(@PathVariable("days") long days)
    {
        return ResponseEntity.ok().body(this.bookingService.getUpcomingBookings(days));
    }

}
