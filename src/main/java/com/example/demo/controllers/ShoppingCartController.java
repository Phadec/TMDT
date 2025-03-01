package com.example.demo.controllers;

import com.example.demo.dtos.ItemShoppingCartDTO;
import com.example.demo.models.ProductForShoppingCart;
import com.example.demo.services.ShoppingCartService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/shopping-cart")
public class ShoppingCartController {
    final ShoppingCartService shoppingCartService;
    @Autowired
    ModelMapper modelMapper;

    public ShoppingCartController(ShoppingCartService shoppingCartService) {
        this.shoppingCartService = shoppingCartService;
    }

    // Lấy ra số lượng sản phẩm đang có trong giỏ hàng
    @PostMapping("/count/{username}")
    public ResponseEntity<Long> getCountOfProductsInCart(@PathVariable String username) {
        // Hàm này cần kiểm tra lại vì đang đếm không đúng
        return ResponseEntity.ok(shoppingCartService.getCountOfProducts(username));
    }

    @GetMapping("/get/{username}")
    public ResponseEntity<Page<Map<String, List<ItemShoppingCartDTO>>>> getProductsByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size // Mặc định lấy 3 ngày gần nhất
    ) {
        Pageable pageable = PageRequest.of(page, size);

        // Lấy danh sách sản phẩm theo ngày từ MongoDB
        Map<String, List<ProductForShoppingCart>> productsByDate = shoppingCartService.getProducts(username, pageable);

        if (productsByDate.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content nếu không có sản phẩm
        }

        // Chuyển đổi từ ProductForShoppingCart -> ItemShoppingCartDTO
        List<Map<String, List<ItemShoppingCartDTO>>> itemsList = productsByDate.entrySet().stream()
                .map(entry -> Map.of(
                        entry.getKey(), // Ngày
                        entry.getValue().stream()
                                .map(product -> modelMapper.map(product, ItemShoppingCartDTO.class))
                                .collect(Collectors.toList()) // Danh sách sản phẩm
                ))
                .collect(Collectors.toList());

        // Tạo Page từ danh sách đã chuyển đổi
        Page<Map<String, List<ItemShoppingCartDTO>>> items = new PageImpl<>(itemsList, pageable, itemsList.size());

        return ResponseEntity.ok(items);
    }


    // Thêm các sản phẩm vào giỏ hàng
    @PostMapping("/add/{username}")
    public void addProducts(@PathVariable String username, @RequestBody List<ItemShoppingCartDTO> products) {
        // Chuyển đổi cho service xử lý
        List<ProductForShoppingCart> productsForService = products.stream()
                .map(product -> modelMapper.map(product, ProductForShoppingCart.class))
                .toList();
        shoppingCartService.saveProducts(username, productsForService);
    }

    // Xóa các sản phẩm khỏi giỏ hàng
    @DeleteMapping("/delete/{username}")
    public ResponseEntity<Boolean> deleteProducts(@PathVariable String username, @RequestBody List<String> idProducts) {
        boolean deleted = shoppingCartService.removeProducts(username, idProducts);
        return ResponseEntity.ok(deleted);
    }
}
