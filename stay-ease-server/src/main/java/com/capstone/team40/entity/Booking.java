package com.capstone.team40.entity;

import com.capstone.team40.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name="BOOKING")
public class Booking
{
    @Id
    @Column(name="ID")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name="ROOM_ID")
    private UUID roomId;
    @Column(name="CHECKIN_DATE")
    private LocalDateTime checkInDate;
    @Column(name="CHECKOUT_DATE")
    private LocalDateTime checkOutDate;

    @Column(name="BOOKING_STATUS")
    @Enumerated(EnumType.STRING)
    private BookingStatus bookingStatus;

    @Column(name="CREATED_BY")
    private String createdBy;
}
