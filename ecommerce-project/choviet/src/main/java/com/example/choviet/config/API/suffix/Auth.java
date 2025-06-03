package com.example.choviet.config.api.suffix;

public interface Auth {
    String LOGIN = "/login";
    String REGISTER = "/register";
    String UPDATE_STATUS = "/{id}/status";
    String EMAIL_EXIST = "/exist";
    String LOGOUT = "/logout";
    String CHANGE_PASS = "/change";
    String FORGOT_PASS = "/forgot";
}
