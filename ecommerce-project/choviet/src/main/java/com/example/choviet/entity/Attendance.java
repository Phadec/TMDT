package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "attendance")
@Data
public class Attendance {
    @Id
    private String id;

    private User user;

    private Shift shift;

    private LocalDateTime checkIn;

    private LocalDateTime checkOut;

    private AttendanceStatus attendanceStatus;
    private String note;
}