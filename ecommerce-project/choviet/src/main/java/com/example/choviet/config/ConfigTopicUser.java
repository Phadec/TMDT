package com.example.choviet.config;

public class ConfigTopicUser {
    private ConfigTopicUser() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    // Các biến queue của rabbitmq
    public static final String USER_EXCHANGE = "user.exchange";



    public static final String LOGIN_QUEUE = "user.login";
    public static final String REGISTER_QUEUE = "user.register";
    public static final String LOGOUT_QUEUE = "user.logout";
    public static final String VERIFY_EMAIL_QUEUE = "user.verify_email";
    public static final String CONTACT_EMAIL_QUEUE = "user.contact_email";
    public static final String CHANGE_PASSWORD_QUEUE = "user.change_password";
    public static final String FORGOT_PASSWORD_QUEUE = "user.forgot_password";



    // Các biến lắng nghe luồng của rabbitmq
    public static final String LOGIN_QUEUE_LISTENER = "user.login.queue";
    public static final String REGISTER_QUEUE_LISTENER = "user.register.queue";
    public static final String LOGOUT_QUEUE_LISTENER = "user.logout.queue";
    public static final String VERIFY_EMAIL_QUEUE_LISTENER = "user.verify_email.queue";
    public static final String CONTACT_EMAIL_QUEUE_LISTENER = "user.contact_email.queue";
    public static final String CHANGE_PASSWORD_QUEUE_LISTENER = "user.change_password.queue";
    public static final String FORGOT_PASSWORD_QUEUE_LISTENER = "user.forgot_password.queue";
}
