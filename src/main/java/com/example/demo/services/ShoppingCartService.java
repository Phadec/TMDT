package com.example.demo.services;

import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.models.ShoppingCart;
import com.example.demo.repositories.ShoppingCartRepository;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ShoppingCartService {
    @Autowired
    ShoppingCartRepository shoppingCartRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    // Đếm số lượng sản phẩm của user này
    public long getCountOfProducts(String username) {
        Query query = new Query(Criteria.where("username").is(username));
        query.fields().include("count"); // Chỉ lấy trường "count", không lấy toàn bộ document

        ShoppingCart cart = mongoTemplate.findOne(query, ShoppingCart.class);

        return (cart != null) ? cart.getCount() : 0;
    }

    // Lưu danh sách sản phẩm muốn thêm vào giỏ
    public void saveProducts(String username, List<ProductForShoppingCart> products) {
        // !!! Tình huống sản phẩm đã có phải được check
        final SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
        Date currentDate = new Date();
        String formatDate = dateFormat.format(currentDate);

        Query query = new Query(Criteria.where("username").is(username));

        // Đẩy danh sách sản phẩm vào ngày tương ứng
        // Mà không cần lấy toàn bộ ra
        Update update = new Update().push("products" + formatDate).each(products);

        mongoTemplate.upsert(query, update, ShoppingCart.class);
    }

    // Lấy danh sách sản phẩm có phân trang
    public Map<String, List<ProductForShoppingCart>> getProducts(String username, Pageable pageable) {
        int size = pageable.getPageSize();
        int skip = (int) pageable.getOffset();

        Aggregation aggregation = Aggregation.newAggregation(
                // Tìm user theo username
                Aggregation.match(Criteria.where("username").is(username)),

                // Biến products từ Object thành mảng key-value để xử lý
                Aggregation.project()
                        .andExpression("objectToArray('$products')").as("productsArray"),

                // Áp dụng phân trang bằng slice(skip, size)
                Aggregation.project()
                        .andExpression("slice('$productsArray', " + skip + ", " + size + ")")
                        .as("paginatedProducts"),

                // Chuyển về dạng Map (Key: ngày, Value: List sản phẩm)
                Aggregation.project()
                        .andExpression("arrayToObject('$paginatedProducts')")
                        .as("filteredProducts")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "shoppingCart", Document.class);
        Document result = results.getUniqueMappedResult();

        if (result == null || !result.containsKey("filteredProducts")) {
            return Map.of();
        }

        Document filteredProducts = (Document) result.get("filteredProducts");

        return filteredProducts.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> mongoTemplate.getConverter().read(List.class, (Document) e.getValue()) // Chuyển thành List<ProductForShoppingCart>
                ));
    }

    // Loại bỏ sản phẩm khỏi giỏ hàng của người dùng
    public boolean removeProducts(String username, List<String> idProducts) {
        Query query = new Query(Criteria.where("username").is(username));

        Update update = new Update();

        // Xóa từng sản phẩm theo id từ tất cả ngày trong giỏ hàng
        idProducts.forEach(id -> {
            update.pull("products.$[].id", id); // Xóa sản phẩm có id tương ứng trong danh sách
        });

        var result = mongoTemplate.updateFirst(query, update, ShoppingCart.class);
        return result.getModifiedCount() > 0;
    }

    // Cập nhật số lượng sản phẩm hiện có trong giỏ hàng
    private void updateQuantity(String username, int quantity) {
        Query query = new Query(Criteria.where("username").is(username));
        Update update = new Update().inc("count", quantity);
        mongoTemplate.updateFirst(query, update, ShoppingCart.class);
    }
}
