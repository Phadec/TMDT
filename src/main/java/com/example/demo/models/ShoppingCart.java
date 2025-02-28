package com.example.demo.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Document(collection = "shopping_cart")
@Data
public class ShoppingCart {
    @Id
    String id = "shopping_cart"; // Cố định ID để lưu toàn bộ users vào 1 document
    String username;
    // Thay vì lưu toàn bộ thông tin, hoặc trỏ bảng thì lưu thông tin cần thiết.
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    Map<Date, List<ProductForShoppingCart>> products;

    public ShoppingCart(String username, Map<Date, List<ProductForShoppingCart>> products) {
        this.username = username;
        this.products = products;
    }

    /**
     * Mỗi người dùng có nhiều giỏ hàng.
     * Mỗi giỏ hàng được phân theo thời gian tạo ra. => Tính năng mua hàng toàn bộ theo ngày, sắp xếp
     * Mỗi giỏ hàng có thể chứa nhiều sản phẩm.
     * Lấy ý tưởng chính từ việc đi siêu thị.
     * Khi bước vào siêu thị,
     * người dùng có thể tùy ý lựa giỏ, có thể lấy nhiều,
     * mỗi giỏ phục vụ 1 tính năng cá nhân người dùng quy định.
     */
}
