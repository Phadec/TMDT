package com.example.demo.enums;

public enum ProductCondition {
    NEW("NEW"),          // Mới
    LIKE_NEW("LIKE_NEW"), // Như mới
    GOOD("GOOD"),       // Tốt
    FAIR("FAIR"),       // Tạm được
    POOR("POOR");       // Kém

    private String value;

    ProductCondition(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
