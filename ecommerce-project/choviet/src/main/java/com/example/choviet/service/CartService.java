package com.example.choviet.service;
import com.example.choviet.entity.Cart;
import com.example.choviet.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    PagingService pagingService;

    @Autowired
    RedisService redisService;

    // thêm sản phẩm vào giỏ hàng
    public void add(Cart cart){
//        cartRepository.save(cart);
//        Cart cartSaved = cartRepository.findByCustomerId(cart.getCustomer().getId());
        String cartId = cart.getId();

        if(redisService.isKeyExists(cartId)){
            List<Map<String, String>> products = (List<Map<String, String>>) redisService.get(cartId);

            Iterator<Map<String, String>> iterator = products.iterator();
            while (iterator.hasNext()) {
                Map<String, String> p = iterator.next();
                if (p.containsValue(cart.getProduct().get(0).get("productId"))) {
                    return;
                }
            }

            products.addAll(cart.getProduct());
            redisService.set(cartId, products, 30L, TimeUnit.DAYS);
            return;
        }
        redisService.set(cartId, cart.getProduct(), 30L, TimeUnit.DAYS);
    }

    // xóa sản phẩm
    public List<Map<String, String>> delete(String id, String productId){
        if(!redisService.isKeyExists(id)) return null;
        List<Map<String, String>> products = (List<Map<String, String>>) redisService.get(id);

        Iterator<Map<String, String>> iterator = products.iterator();
        while (iterator.hasNext()) {
            Map<String, String> p = iterator.next();
            String pId = p.get("productId");
            if (pId.equals(productId)) {
                iterator.remove();
            }
        }
        if(products.isEmpty()){
            redisService.delete(id);
            return products;
        }
        redisService.set(id, products, 30L, TimeUnit.DAYS);
        return products;
    }

    // lấy tất cả sản phẩm từ giỏ hàng
    public List<Map<String, String>> get(String id){
//        Pageable pageable = pagingService.createPageable(page, size);
//        return cartRepository.findAll(pageable);
        List<Map<String, String>> products = (List<Map<String, String>>) redisService.get(id);
        return products;
    }
}
