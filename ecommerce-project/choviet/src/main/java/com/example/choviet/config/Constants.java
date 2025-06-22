package com.example.choviet.config;

import java.util.List;
import java.util.Map;

import com.example.choviet.entity.Order;

public interface Constants {
    
    Long EMAIL_TOKEN_EXPIRY_MINUTES = 2L; // minutes

    Map<Order.Status, List<Order.Status>> VALID_TRANSITIONS = Map.ofEntries(
            Map.entry(Order.Status.READY_TO_PICK, List.of(Order.Status.PICKING, Order.Status.CANCEL)),
            Map.entry(Order.Status.PICKING, List.of(Order.Status.PICKED, Order.Status.CANCEL)),
            Map.entry(Order.Status.PICKED, List.of(Order.Status.STORING, Order.Status.CANCEL)),
            Map.entry(Order.Status.STORING, List.of(Order.Status.TRANSPORTING)),
            Map.entry(Order.Status.TRANSPORTING, List.of(Order.Status.DELIVERING)),
            Map.entry(Order.Status.DELIVERING, List.of(Order.Status.DELIVERED, Order.Status.DELIVERY_FAIL)),
            Map.entry(Order.Status.DELIVERY_FAIL, List.of(Order.Status.WAITING_TO_RETURN)),
            Map.entry(Order.Status.WAITING_TO_RETURN, List.of(Order.Status.RETURN)),
            Map.entry(Order.Status.RETURN, List.of(Order.Status.RETURN_TRANSPORTING)),
            Map.entry(Order.Status.RETURN_TRANSPORTING, List.of(Order.Status.RETURNING)),
            Map.entry(Order.Status.RETURNING, List.of(Order.Status.RETURNED, Order.Status.RETURN_FAIL)),
            Map.entry(Order.Status.RETURNED, List.of()),
            Map.entry(Order.Status.RETURN_FAIL, List.of()),
            Map.entry(Order.Status.DELIVERED, List.of()),
            Map.entry(Order.Status.CANCEL, List.of())
    );

    int PAGE = 100;
    int SIZE_15 = 15;
    int SIZE_25 = 25;
    int SIZE_35 = 35;
}
