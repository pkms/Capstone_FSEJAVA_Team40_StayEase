package com.capstone.team40.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name="HOTEL")
@Setter
@Getter
@NoArgsConstructor
public class Hotel
{
    @Id
    @Column(name="ID")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name="NAME")
    private String name;
    @Column(name="CITY")
    private String city;
    @Column(name="STAR_RATING")
    private int starRating;
    @Column(name="DESCRIPTION")
    private String description;
    @Column(name="COVER_IMAGE_URL")
    private String coverImageUrl;

    @Column(name="MANAGER_ID")
    private UUID managerId;

    @Column(name="CREATED_AT")
    private LocalDateTime createdAt;
}
