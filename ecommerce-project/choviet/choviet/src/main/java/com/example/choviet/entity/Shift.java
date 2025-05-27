package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "shifts")
@Data
public class Shift {
    @Id
    private String id;

    private String shiftName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}