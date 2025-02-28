package com.example.demo.services;

import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.models.ShoppingCart;
import com.example.demo.repositories.ShoppingCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ShoppingCartService {
    @Autowired
    ShoppingCartRepository shoppingCartRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    // Đếm số lượng sản phẩm của user này
    public long getCountOfProducts(String username) {
        // Tìm document có _id = "shopping_cart"
        MatchOperation match = Aggregation.match(Criteria.where("_id").is("shopping_cart"));

        // Tính tổng số sản phẩm của user mà không lấy dữ liệu
        ProjectionOperation project = Aggregation.project()
                .and(ArrayOperators.Size.lengthOfArray("users." + username)).as("totalProducts");

        Aggregation aggregation = Aggregation.newAggregation(match, project);
        AggregationResults<Long> results = mongoTemplate.aggregate(aggregation, "shopping_cart", Long.class);

        return results.getUniqueMappedResult() != null ? results.getUniqueMappedResult() : 0;
    }

    public void saveProducts(String username, List<ProductForShoppingCart> products) {
        Date currentDate = new Date(); // Chỉ tạo một đối tượng Date

        Query query = new Query(Criteria.where("username").is(username));

        // Kiểm tra giỏ hàng đã tồn tại hay chưa
        ShoppingCart shoppingCart = mongoTemplate.findOne(query, ShoppingCart.class);

        if (shoppingCart == null) {
            // Nếu chưa có, tạo giỏ hàng mới
            Map<Date, List<ProductForShoppingCart>> mapProducts = new HashMap<>();
            mapProducts.put(currentDate, new ArrayList<>(products)); // Thêm tất cả sản phẩm vào luôn
            shoppingCart = new ShoppingCart(username, mapProducts);
            shoppingCartRepository.save(shoppingCart);
        } else {
            // Nếu đã có, cập nhật giỏ hàng hiện tại
            Query updateQuery = new Query(Criteria.where("username").is(username));
            Update update = new Update().push("products." + currentDate, products);
            mongoTemplate.updateFirst(updateQuery, update, ShoppingCart.class);
        }
    }

}
