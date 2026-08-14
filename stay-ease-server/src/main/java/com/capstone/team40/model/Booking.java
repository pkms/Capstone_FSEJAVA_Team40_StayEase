package com.capstone.team40.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name="BOOKING")
@Setter
@Getter
@NoArgsConstructor
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
    @Column(name="CREATED_BY")
    private String createdBy;
}
