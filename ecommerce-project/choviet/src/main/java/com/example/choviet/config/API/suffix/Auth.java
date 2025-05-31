package com.example.choviet.config.API.suffix;

public class Auth {
    private Auth() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    public static final String LOGIN = "/login";
    public static final String REGISTER = "/register";
    public static final String UPDATE_STATUS = "/{id}/status";
    public static final String EMAIL_EXIST = "/exist";
    public static final String REFRESH_TOKEN = "/refresh-token";
    public static final String LOGOUT = "/logout";
    public static final String CHANGE_PASS = "/change";
    public static final String FORGOT_PASS = "/forgot";
}
