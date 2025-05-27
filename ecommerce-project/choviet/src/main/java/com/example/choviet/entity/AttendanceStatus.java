package com.example.choviet.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "attendance_statuses")
public class AttendanceStatus {
    @Id
    private String id;
    private Type name;

    public enum Type {
        PRESENT, LATE, ABSENT
    }
}
