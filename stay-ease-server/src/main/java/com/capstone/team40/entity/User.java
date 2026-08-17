package com.capstone.team40.entity;

import com.capstone.team40.enums.Role;
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
@Table(name="USERS")
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
