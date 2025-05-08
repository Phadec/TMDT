package com.example.user_service.config;

public final class Constants {
    private Constants() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    public static final int EMAIL_TOKEN_EXPIRY_MINUTES = 2;

    // Các biến queue của rabbitmq
    public static final String EXCHANGE = "user.exchange";
    public static final String LOGIN_QUEUE = "user.login";
    public static final String REGISTER_QUEUE = "user.register";
    public static final String LOGOUT_QUEUE = "user.logout";
    public static final String VERIFY_EMAIL_QUEUE = "user.verify_email";
    public static final String CHANGE_PASSWORD_QUEUE = "user.change_password";
    public static final String FORGOT_PASSWORD_QUEUE = "user.forgot_password";

}