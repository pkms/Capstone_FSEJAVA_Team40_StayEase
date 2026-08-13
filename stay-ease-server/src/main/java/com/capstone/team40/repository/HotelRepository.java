package com.capstone.team40.repository;

import com.capstone.team40.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, UUID>
{
    List<Hotel> findByCity(String city);
}
