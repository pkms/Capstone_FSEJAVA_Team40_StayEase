package com.capstone.team40.repository;

import com.capstone.team40.entity.User;
import com.capstone.team40.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>
{
    User findByEmail(String email);
    List<User> findByRole(Role role);
}
