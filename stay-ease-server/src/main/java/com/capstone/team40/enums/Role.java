package com.capstone.team40.enums;

public enum Role
{
    GUEST("GUEST"),
    MANAGER("MANAGER"),
    ADMIN("ADMIN");

    private final String name;

    Role(String name)
    {
        this.name = name;
    }
}
