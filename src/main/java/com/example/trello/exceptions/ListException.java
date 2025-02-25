package com.example.trello.exceptions;

public class ListException extends RuntimeException {
    private final String code;

    public ListException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static final String LIST_NOT_FOUND = "LIST_001";
    public static final String INVALID_POSITION = "LIST_002";
    public static final String BOARD_NOT_FOUND = "LIST_003";
    public static final String UNAUTHORIZED_ACCESS = "LIST_004";
}
