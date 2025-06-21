package com.example.choviet.config.api.suffix;

public interface Product {
    String UPDATE_STATUS = "/{id}/status";
    String CREATE_PRODUCTS = "/batch";
    String DETAIL = "/{id}";
    String GET_PRODUCTS_BY_CATEGORY = "/category/{id}";
    String SIMILAR_PRODUCTS = "/{id}/similar";
    String REVIEWS = "/{id}/reviews";
}
