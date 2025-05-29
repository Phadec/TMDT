package com.example.choviet.consumer;
import com.example.choviet.dto.Event;
import com.example.choviet.entity.Product;
import com.example.choviet.repository.ProductRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static com.example.choviet.config.ConfigTopicProduct.*;

@Component
public class ProductConsumer {
    @Autowired
    private ProductRepository productRepository;

    @RabbitListener(queues = ADD_PRODUCTS_LISTENER)
    public void handleLoginEvent(Event<Product> event) {
        try {
            if (event.getDataList() != null && !event.getDataList().isEmpty()) {
                productRepository.saveAll(event.getDataList());
                System.out.println("Saved products to MongoDB " +  event.getDataList().size());
            } else {
                System.out.println("Received empty product list");
            }
        } catch (Exception e) {
            System.out.println("Failed to save products to MongoDB" + e);
        }
    }
}
