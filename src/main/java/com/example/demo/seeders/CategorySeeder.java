package com.example.demo.seeders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.example.demo.repositories.CategoryRepository;
import com.example.demo.models.Category;

@Component
public class CategorySeeder {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public void seed() {
        if (categoryRepository.count() == 0) {
            // Level 1 Categories
            Category electronics = createCategory("Electronics", "electronics", "Electronic devices and accessories", null, 1);
            Category vehicles = createCategory("Vehicles", "vehicles", "Cars, motorcycles and vehicles", null, 1);
            Category fashion = createCategory("Fashion", "fashion", "Clothing, shoes and accessories", null, 1);
            Category furniture = createCategory("Home & Furniture", "furniture", "Furniture and home items", null, 1);
            
            // Level 2 Electronics
            createCategory("Smartphones", "smartphones", "Mobile phones and accessories", electronics.getId(), 2);
            createCategory("Laptops", "laptops", "Laptops and accessories", electronics.getId(), 2);
            createCategory("Cameras", "cameras", "Cameras and photography equipment", electronics.getId(), 2);
            
            // Level 2 Vehicles
            createCategory("Cars", "cars", "New and used cars", vehicles.getId(), 2);
            createCategory("Motorcycles", "motorcycles", "New and used motorcycles", vehicles.getId(), 2);
            createCategory("Bicycles", "bicycles", "New and used bicycles", vehicles.getId(), 2);
            
            // Level 2 Fashion
            createCategory("Men's Clothing", "mens-clothing", "Men's apparel", fashion.getId(), 2);
            createCategory("Women's Clothing", "womens-clothing", "Women's apparel", fashion.getId(), 2);
            createCategory("Accessories", "accessories", "Fashion accessories", fashion.getId(), 2);
            
            // Level 2 Furniture
            createCategory("Living Room", "living-room", "Living room furniture", furniture.getId(), 2);
            createCategory("Bedroom", "bedroom", "Bedroom furniture", furniture.getId(), 2);
            createCategory("Kitchen", "kitchen", "Kitchen and dining furniture", furniture.getId(), 2);
        }
    }
    
    private Category createCategory(String name, String slug, String description, String parentId, int level) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setDescription(description);
        category.setParentId(parentId);
        category.setLevel(level);
        category.setActive(true);
        return categoryRepository.save(category);
    }
}
