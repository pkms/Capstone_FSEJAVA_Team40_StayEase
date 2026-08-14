package com.capstone.team40.model;

import com.capstone.team40.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name="USERS")
@Setter
@Getter
@NoArgsConstructor
public class User
{
    @Id
    @Column(name="ID")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name="EMAIL")
    private String email;
    @Column(name="NAME")
    private String name;
    @Column(name="PASSWORD_HASH")
    private String passwordHash;
    @Column(name="ROLE")
    @Enumerated(EnumType.STRING)
    private Role role;
    @Column(name="CREATED_AT")
    private LocalDateTime createdAt;
}
