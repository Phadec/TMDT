package com.example.demo.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class ItemShoppingCartDTO {
    String id;
    String title;
    String description;
    String mainImage;
    Date dateCreated;
     // Thay vì lưu toàn bộ thông tin, hoặc trỏ bảng thì lưu thông tin cần thiết.
}
