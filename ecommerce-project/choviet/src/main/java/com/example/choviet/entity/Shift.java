package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "shifts")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Shift {
    @Id
    String id;

    String shiftName;

    LocalDateTime startTime;

    LocalDateTime endTime;
}