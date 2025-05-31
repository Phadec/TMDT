package com.example.choviet.entity;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "attendance_statuses")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttendanceStatus {
    @Id
    String id;
    Type name;

    public enum Type {
        PRESENT, LATE, ABSENT
    }
}
