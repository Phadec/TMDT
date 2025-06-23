package com.example.choviet.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.cache.CacheProperties.Redis;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.example.choviet.dto.CategoryDto;
import com.example.choviet.entity.ProductCategory;
import com.example.choviet.repository.CategoryRepository;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    RedisService redisService;

    public List<CategoryDto> getAllCategories() {
        String redisKey = "categories";

        // Kiểm tra khóa có tồn tại không
        if (redisService.isKeyExists(redisKey)) {
            Object cached = redisService.get(redisKey);
            if (cached instanceof List<?>) {
                List<?> cachedList = (List<?>) cached;
                if (cachedList.isEmpty() || cachedList.get(0) instanceof String) {
                    @SuppressWarnings("unchecked")
                    List<CategoryDto> safeList = (List<CategoryDto>) cachedList;
                    return safeList;
                }
            }
        }

        // Nếu không có trong cache, lấy từ DB và lưu vào Redis
        List<CategoryDto> categories = fetchCategoriesFromDatabase();
        redisService.set(redisKey, categories, 30L, TimeUnit.DAYS);
        return categories;
    }

    private List<CategoryDto> fetchCategoriesFromDatabase() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
    }

}
