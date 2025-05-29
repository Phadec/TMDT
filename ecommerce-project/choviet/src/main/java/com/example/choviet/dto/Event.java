package com.example.choviet.dto;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Event<T> implements Serializable {
    private T data;
    private List<T> dataList;
    private LocalDateTime createdAt;
    private String action;
}