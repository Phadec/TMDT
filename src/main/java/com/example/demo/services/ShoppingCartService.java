package com.example.demo.services;

import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.models.ShoppingCart;
import com.example.demo.repositories.ShoppingCartRepository;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShoppingCartService {
    @Autowired
    ShoppingCartRepository shoppingCartRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    // Đếm số lượng sản phẩm của user này
    public long getCountOfProducts(String username) {
        return shoppingCartRepository.findCountByUsername(username);
    }

    // Lưu danh sách sản phẩm muốn thêm vào giỏ
    public void saveProducts(String username, List<ProductForShoppingCart> products) {
        Query query = new Query(Criteria.where("username").is(username));

        // Thêm sản phẩm vào mảng `products` và cập nhật số lượng sản phẩm trong giỏ hàng
        Update update = new Update()
                .inc("count", products.size())
                .addToSet("products")
                .each(products.toArray());

        // Nếu không tồn tại, tạo mới giỏ hàng
        mongoTemplate.upsert(query, update, ShoppingCart.class);
    }

    // Lấy danh sách sản phẩm có phân trang
    public List<ProductForShoppingCart> getProducts(String username, Pageable pageable) {
        return shoppingCartRepository.findProductsByUsername(username, pageable);
    }

    // Loại bỏ sản phẩm khỏi giỏ hàng của người dùng
    public boolean removeProducts(String username, List<String> idProducts) {
        List<ObjectId> objectIdList = idProducts.stream()
                .map(ObjectId::new)
                .collect(Collectors.toList());

        Query query = new Query(Criteria.where("username").is(username));
        Update update = new Update().pull("products", new Document("_id", new Document("$in", objectIdList)));

        UpdateResult result = mongoTemplate.updateFirst(query, update, ShoppingCart.class);
        return result.getModifiedCount() > 0;
    }
}
