package com.example.choviet.config.API.suffix;

public class Verify {
    private Verify() {
        throw new AssertionError("Cannot instantiate Constants class");
    }

    public static final String SEND_VERIFICATION_EMAIL = "/send";
    public static final String VALIDATE_EMAIL_TOKEN = "/confirm";
}
