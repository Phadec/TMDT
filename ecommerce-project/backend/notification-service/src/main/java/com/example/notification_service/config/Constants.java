package com.example.notification_service.config;

public final class Constants {
    private Constants() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    // Các biến lắng nghe luồng  của rabbitmq
    public static final String LOGIN_QUEUE_LISTENER = "user.login.queue";
    public static final String REGISTER_QUEUE_LISTENER = "user.register.queue";
    public static final String LOGOUT_QUEUE_LISTENER = "user.logout.queue";

    public static final String VERIFY_EMAIL_QUEUE_LISTENER = "user.verify_email.queue";
    public static final String CHANGE_PASSWORD_QUEUE_LISTENER = "user.change_password.queue";
    public static final String FORGOT_PASSWORD_QUEUE_LISTENER = "user.forgot_password.queue";

}