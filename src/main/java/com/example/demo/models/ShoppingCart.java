package com.example.demo.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "shopping_cart")
@Data
public class ShoppingCart {
    @Id
    String username;
    long count;
    Map<String, List<ProductForShoppingCart>> products;

    /**
     * Lấy ý tưởng từ việc đi siêu thị.
     * Mỗi người dùng có nhiều giỏ hàng (quản lý ngăn cách bằng ngày). Into Map String - Date, List - Products
     * Người dùng biết mình đã mua bao nhiêu sản phẩm => Value Long in Pair
     * Cửa hàng quản lý người dùng thông qua username => Key String in Pair
     */
}
