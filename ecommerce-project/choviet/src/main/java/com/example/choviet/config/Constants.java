package com.example.choviet.config;

public class Constants {
    private Constants() {
        throw new AssertionError("Cannot instantiate Constants class");
    }
    public static final int EMAIL_TOKEN_EXPIRY_MINUTES = 2; // minutes

    // Các biến queue của rabbitmq
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String LOGIN_QUEUE = "user.login";
    public static final String REGISTER_QUEUE = "user.register";
    public static final String LOGOUT_QUEUE = "user.logout";
    public static final String VERIFY_EMAIL_QUEUE = "user.verify_email";
    public static final String CHANGE_PASSWORD_QUEUE = "user.change_password";
    public static final String FORGOT_PASSWORD_QUEUE = "user.forgot_password";

    // Các biến lắng nghe luồng  của rabbitmq
    public static final String LOGIN_QUEUE_LISTENER = "user.login.queue";
    public static final String REGISTER_QUEUE_LISTENER = "user.register.queue";
    public static final String LOGOUT_QUEUE_LISTENER = "user.logout.queue";
    public static final String VERIFY_EMAIL_QUEUE_LISTENER = "user.verify_email.queue";
    public static final String CHANGE_PASSWORD_QUEUE_LISTENER = "user.change_password.queue";
    public static final String FORGOT_PASSWORD_QUEUE_LISTENER = "user.forgot_password.queue";

    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String PAYMENT_QUEUE = "order.payment";
    public static final String ORDER_QUEUE = "order.order";
    public static final String PAYMENT_QUEUE_LISTENER = "order.payment.queue";
    public static final String ORDER_QUEUE_LISTENER = "order.order.queue";
}
