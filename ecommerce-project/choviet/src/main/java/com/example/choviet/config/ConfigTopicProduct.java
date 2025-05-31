package com.example.choviet.config;

import org.springframework.context.annotation.Configuration;

public class ConfigTopicProduct {
    public static final String PRODUCT_EXCHANGE = "product.exchange";
    public static final String ADD_PRODUCTS_QUEUE = "product.add_products";
    public static final String ADD_PRODUCTS_LISTENER = "product.add_products.queue";
}
