package com.capstone.team40.model;

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
