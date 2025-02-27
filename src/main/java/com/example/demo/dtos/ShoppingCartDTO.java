package com.example.demo.dtos;

import lombok.Data;

import java.util.Date;
import java.util.Map;

@Data
public class ShoppingCartDTO {
    Map<Date, ItemShoppingCartDTO> items;
}
