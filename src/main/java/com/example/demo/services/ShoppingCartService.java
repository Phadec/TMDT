package com.example.demo.services;

import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.models.ShoppingCart;
import com.example.demo.repositories.ShoppingCartRepository;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
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

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.project()
                        .and(ConditionalOperators.ifNull("products").then(new Document()))
                        .as("productsMap"),

                Aggregation.unwind("productsMap"),

                Aggregation.group()
                        .sum(ArrayOperators.Size.lengthOfArray("productsMap.v")).as("totalProducts")
        );

        // Thực thi Aggregation
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "shopping_cart", Document.class);

        // Lấy kết quả duy nhất và tránh load dữ liệu không cần thiết
        Document result = results.getUniqueMappedResult();
        int totalProducts = result != null ? result.getInteger("totalProducts", 0) : 0;

        return totalProducts;
    }

    // Lưu danh sách sản phẩm muốn thêm vào giỏ
    public void saveProducts(String username, List<ProductForShoppingCart> products) {
        final SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
        Date currentDate = new Date(); // Chỉ tạo một đối tượng Date
        String formatDate = dateFormat.format(currentDate);

        Query query = new Query(Criteria.where("username").is(username));

        // Kiểm tra giỏ hàng đã tồn tại hay chưa
        ShoppingCart shoppingCart = mongoTemplate.findOne(query, ShoppingCart.class);

        if (shoppingCart == null) {
            // Nếu chưa có, tạo giỏ hàng mới
            Map<String, List<ProductForShoppingCart>> mapProducts = new HashMap<>();
            mapProducts.put(formatDate, new ArrayList<>(products)); // Thêm tất cả sản phẩm vào luôn
            shoppingCart = new ShoppingCart(username, mapProducts);
            shoppingCartRepository.save(shoppingCart);
        } else {
            // Nếu đã có, cập nhật giỏ hàng hiện tại
            Query updateQuery = new Query(Criteria.where("username").is(username));
            Update update = new Update().push("products." + formatDate, products);
            mongoTemplate.updateFirst(updateQuery, update, ShoppingCart.class);
        }
    }

    // Lấy danh sách sản phẩm có phân trang
    public List<ProductForShoppingCart> getProducts(String username, Pageable pageable) {
        Query query = new Query(Criteria.where("username").is(username));
        ShoppingCart cart = mongoTemplate.findOne(query, ShoppingCart.class);

        if (cart == null || cart.getProducts().isEmpty()) {
            return null; // Trả về trang rỗng nếu không có sản phẩm
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
            return null;
        }

        return allProducts.subList(start, end);
    }

    // Loại bỏ sản phẩm khỏi giỏ hàng của người dùng
    public boolean removeProducts(String username, List<String> idProducts) {
        Query query = new Query(Criteria.where("username").is(username));

        Update update = new Update();
        update.pull("products.$[].value", new Query(Criteria.where("productId").in(idProducts)));

        UpdateResult result = mongoTemplate.updateFirst(query, update, ShoppingCart.class);

        return result.getModifiedCount() > 0; // Trả về true nếu có sản phẩm bị xóa
    }
}
