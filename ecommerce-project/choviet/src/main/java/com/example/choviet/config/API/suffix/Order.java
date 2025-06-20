package com.example.choviet.config.api.suffix;

public interface Order {
    String GET_ORDERS_BY_STATUS = "/status";
    String UPDATE_STATUS = "/{orderId}/status";
    String GET_ORDERS_BY_CUSTOMER_AND_STATUS = "/get/status";
    String GET_ORDERS = "/get";
    String DETAIL = "/detail";
}
