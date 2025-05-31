package com.example.choviet.dto;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Event<T> implements Serializable {
    T data;
    List<T> dataList;
    LocalDateTime createdAt;
    String action;
}