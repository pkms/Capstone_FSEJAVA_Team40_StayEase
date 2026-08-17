package com.capstone.team40.controller;

import com.capstone.team40.model.CreateUserRequest;
import com.capstone.team40.model.LoginRequest;
import com.capstone.team40.service.JwtService;
import com.capstone.team40.service.UserService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/auth")
public class AuthenticationController
{
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody CreateUserRequest createUserRequest)
    {
        return this.userService.registerUser(createUserRequest) ? ResponseEntity.status(HttpStatus.CREATED).body("User Registered Successfully !") :
                ResponseEntity.badRequest().body("User already exists in the system ! Try a different Email ID");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest)
    {
        return this.userService.login(loginRequest) ? ResponseEntity.ok().body(this.jwtService.generateToken(loginRequest.email())) : ResponseEntity.badRequest().body("User does not exists in the system or password did not match");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody LoginRequest loginRequest)
    {
        return StringUtils.isNotBlank(loginRequest.email()) && StringUtils.isNotBlank(loginRequest.password()) ? ResponseEntity.status(HttpStatus.NO_CONTENT).body("Logout Successful !") : ResponseEntity.badRequest().body("User did not login to the System");
    }
}
