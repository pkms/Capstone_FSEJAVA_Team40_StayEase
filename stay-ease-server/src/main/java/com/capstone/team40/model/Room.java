package com.capstone.team40.model;

import com.capstone.team40.enums.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name="ROOM")
@Setter
@Getter
@NoArgsConstructor
public class Room
{
    @Id
    @Column(name="ID")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name="HOTEL_ID")
    private UUID hotelId;
    @Column(name="ROOM_NUMBER")
    private int roomNumber;
    @Column(name="ROOM_TYPE")
    @Enumerated(EnumType.STRING)
    private RoomType roomType;
    @Column(name="PRICE_PER_NIGHT")
    private double pricePerNight;
    @Column(name="MAX_OCCUPANCY")
    private int maxOccupancy;
    @Column(name="ACTIVE")
    private boolean active;
    @Column(name="CREATED_AT")
    private LocalDateTime createdAt;
}
