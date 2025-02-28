package com.example.demo.dtos;

import lombok.Data;

@Data
public class ItemShoppingCartDTO {
    String id;
    String title;
    String description;
    String mainImage;
     // Thay vì lưu toàn bộ thông tin, hoặc trỏ bảng thì lưu thông tin cần thiết.
}
