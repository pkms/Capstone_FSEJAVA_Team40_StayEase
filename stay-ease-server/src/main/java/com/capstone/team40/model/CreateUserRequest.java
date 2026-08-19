package com.capstone.team40.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(@NotBlank(message = "Email is required")
                                @Email(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Please provide a valid email address")
                                String email,
                                @NotBlank(message = "Name is required")
                                @Size(max = 20, message = "Name should not be more than 20 characters")
                                String name,
                                @NotBlank(message = "Password is required")
                                String password)
{
}
