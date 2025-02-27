package com.example.demo.dtos;

import com.example.demo.models.ProductForShoppingCart;
import lombok.Data;

import java.util.List;

@Data
public class ItemShoppingCartDTO {
    String idShoppingCart;
    List<ProductForShoppingCart> productInfo; // Thay vì lưu toàn bộ thông tin, hoặc trỏ bảng thì lưu thông tin cần thiết.
}
