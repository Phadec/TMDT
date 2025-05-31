package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "attendance")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Attendance {
    @Id
    String id;

    User user;

    Shift shift;

    LocalDateTime checkIn;

    LocalDateTime checkOut;

    AttendanceStatus attendanceStatus;
    String note;
}