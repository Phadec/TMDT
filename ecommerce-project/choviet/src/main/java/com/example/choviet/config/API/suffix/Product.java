package com.example.choviet.config.API.suffix;

public class Product {
    private Product() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    public static final String UPDATE_STATUS = "/{id}/status";
    public static final String CREATE_PRODUCTS = "/batch";
    public static final String DETAIL = "/{id}";

    public static final String GET_PRODUCTS_BY_CATEGORY = "/category/{id}";
}
