package com.example.demo.services;

import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.models.ShoppingCart;
import com.example.demo.repositories.ShoppingCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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

    // Lấy danh sách sản phẩm có phân trang
    public Page<ProductForShoppingCart> getProducts(String username, Pageable pageable) {
        Query query = new Query(Criteria.where("username").is(username));
        ShoppingCart cart = mongoTemplate.findOne(query, ShoppingCart.class);

        if (cart == null || cart.getProducts().isEmpty()) {
            return Page.empty(); // Trả về trang rỗng nếu không có sản phẩm
        }

        // Gộp toàn bộ sản phẩm từ các ngày vào 1 danh sách
        List<ProductForShoppingCart> allProducts = new ArrayList<>();
        cart.getProducts().values().forEach(allProducts::addAll);

        // Sắp xếp theo Pageable
        allProducts.sort(Comparator.comparing(ProductForShoppingCart::getTitle)); // Mặc định sắp xếp theo tên

        // Tính toán phân trang
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allProducts.size());
        if (start > allProducts.size()) {
            return Page.empty();
        }

        List<ProductForShoppingCart> pagedProducts = allProducts.subList(start, end);
        return new PageImpl<>(pagedProducts, pageable, allProducts.size());
    }
}
