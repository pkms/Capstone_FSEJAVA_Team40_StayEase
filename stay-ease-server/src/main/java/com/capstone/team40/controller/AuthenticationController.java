package com.capstone.team40.controller;

import com.capstone.team40.model.CreateUserRequest;
import com.capstone.team40.model.LoginRequest;
import com.capstone.team40.model.UserLoginResponse;
import com.capstone.team40.model.UserResponse;
import com.capstone.team40.service.JwtService;
import com.capstone.team40.service.UserService;
import jakarta.validation.Valid;
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
    public ResponseEntity<String> registerUser(@Valid @RequestBody CreateUserRequest createUserRequest)
    {
        return this.userService.registerUser(createUserRequest) ? ResponseEntity.status(HttpStatus.CREATED).body("User Registered Successfully !") :
                ResponseEntity.badRequest().body("User already exists in the system ! Try a different Email ID");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest)
    {
        UserResponse userResponse = this.userService.login(loginRequest);
        return  userResponse != null ?
                ResponseEntity.ok().body(new UserLoginResponse("Bearer " + this.jwtService.generateToken(loginRequest.email()), userResponse.grantedAuthority().getAuthority(), userResponse.id())) :
                ResponseEntity.badRequest().body("User does not exists in the system or password did not match");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@Valid @RequestBody LoginRequest loginRequest)
    {
        return StringUtils.isNotBlank(loginRequest.email()) && StringUtils.isNotBlank(loginRequest.password()) ? ResponseEntity.status(HttpStatus.NO_CONTENT).body("Logout Successful !") : ResponseEntity.badRequest().body("User did not login to the System");
    }
}
