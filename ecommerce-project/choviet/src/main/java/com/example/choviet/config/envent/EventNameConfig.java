package com.example.choviet.config.envent;

public interface EventNameConfig {
    // User Authentication Events
    String USER_LOGIN = "USER_LOGIN";
    String USER_REGISTER = "USER_REGISTER";
    String USER_LOGOUT = "USER_LOGOUT";
    String USER_CHANGE_PASSWORD = "USER_CHANGE_PASSWORD";
    String USER_FORGET_PASSWORD = "USER_FORGET_PASSWORD";
    String USER_UPDATE_STATUS = "USER_UPDATE_STATUS";
    
    // Email Verification Events
    String EMAIL_VERIFICATION_SENT = "EMAIL_VERIFICATION_SENT";
    String EMAIL_VERIFICATION_SUCCESS = "EMAIL_VERIFICATION_SUCCESS";
    String EMAIL_CONTACT = "EMAIL_CONTACT";
    
    // Product Events
    String PRODUCT_CREATE_BATCH = "PRODUCT_CREATE_BATCH";
    
    // Order Events
    String ORDER_CREATE = "ORDER_CREATE";
}
