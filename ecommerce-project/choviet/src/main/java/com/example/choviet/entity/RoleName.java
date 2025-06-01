//package com.example.choviet.entity;
//
//public enum RoleName {
//    SUPER_ADMIN("SUPER_ADMIN", 1),
//    ADMIN("ADMIN", 2),
//    STAFF_MANAGEMENT("STAFF_MANAGEMENT", 3),
//    STAFF_CHAT("STAFF_CHAT", 4),
//    STAFF_NEWS("STAFF_NEWS", 5);
//
//    private final String name;
//    private final int hierarchy;
//
//    Role(String name, int hierarchy) {
//        this.name = name;
//        this.hierarchy = hierarchy;
//    }
//
//    public String getName() {
//        return name;
//    }
//
//    public int getHierarchy() {
//        return hierarchy;
//    }
//
//    public boolean hasHigherOrEqualAuthority(Role other) {
//        return this.hierarchy <= other.hierarchy;
//    }
//}