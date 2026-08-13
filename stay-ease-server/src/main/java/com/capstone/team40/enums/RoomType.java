package com.capstone.team40.enums;

public enum RoomType
{
    Double("Double"),
    Single("Single"),
    Suite("Suite");

    private final String type;

    RoomType(String type)
    {
        this.type = type;
    }
}
