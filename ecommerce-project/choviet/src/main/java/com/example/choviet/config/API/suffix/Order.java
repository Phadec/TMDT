package com.example.choviet.config.API.suffix;

public class Order {
    private Order() {
        throw new AssertionError("Cannot instantiate Constants class");
    }


    public static final String GET_ORDERS_BY_STATUS = "/status";
    public static final String UPDATE_STATUS = "/{orderId}/status";
    public static final String GET_ORDERS_BY_CUSTOMER_AND_STATUS = "/get/status";
    public static final String GET_ORDERS = "/get";
    public static final String DETAIL = "/detail";

}
