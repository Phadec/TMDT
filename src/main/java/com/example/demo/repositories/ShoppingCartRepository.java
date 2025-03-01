package com.example.demo.repositories;

import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.models.ShoppingCart;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ShoppingCartRepository extends MongoRepository<ShoppingCart, String> {
    @Aggregation(pipeline = {
            "{ $match: { 'username': ?0 } }",
            "{ $project: { count: 1, _id: 0 } }"
    })
    Long findCountByUsername(String username);

    @Aggregation(pipeline = {
            "{ $match: { _id: ?0 } }", // Lọc theo username (_id)
            "{ $unwind: '$products' }", // Tách từng sản phẩm trong mảng products
            "{ $replaceRoot: { newRoot: '$products' } }" // Chỉ lấy dữ liệu của sản phẩm
    })
    List<ProductForShoppingCart> findProductsByUsername(String username, Pageable pageable);
}
