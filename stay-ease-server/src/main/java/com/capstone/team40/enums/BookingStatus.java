package com.capstone.team40.enums;

public enum BookingStatus
{
    COMPLETED("COMPLETED"),
    CANCELLED("CANCELLED");

    private final String status;

    BookingStatus(String status)
    {
        this.status = status;
    }
}
