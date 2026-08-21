package com.capstone.team40.controller;

import com.capstone.team40.enums.Role;
import com.capstone.team40.model.UserResponse;
import com.capstone.team40.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(path = "/api/users")
public class UserController
{
    @Autowired
    private UserService userService;

    @GetMapping("/{role}")
    public ResponseEntity<List<UserResponse>> getAllHotels(@PathVariable("role") Role role)
    {
        return ResponseEntity.ok().body(this.userService.getUsersByRole(role));
    }
}
