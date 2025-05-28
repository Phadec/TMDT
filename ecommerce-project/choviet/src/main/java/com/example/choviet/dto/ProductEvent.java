package com.example.choviet.dto;

import com.example.choviet.entity.Product;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class ProductEvent implements Serializable {
    private List<Product> products;
}
