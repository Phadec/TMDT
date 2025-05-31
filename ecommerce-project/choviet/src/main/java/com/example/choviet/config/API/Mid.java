package com.example.choviet.config.API;

public class Mid {
    private Mid() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    // trung api
    public static final String ORDER = "/orders";
    public static final String PRODUCT = "/products";
    public static final String AUTH = "/auth";
    public static final String USER = "/users";
    public static final String CUSTOMER = "/customers";
    public static final String VERIFY = "/verify";
}
