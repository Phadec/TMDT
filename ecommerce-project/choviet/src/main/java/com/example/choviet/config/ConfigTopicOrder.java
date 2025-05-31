package com.example.choviet.config;

import org.springframework.context.annotation.Configuration;

public class ConfigTopicOrder {
    public static final String ORDER_EXCHANGE = "order.exchange";

    public static final String PAYMENT_QUEUE = "order.payment";
    public static final String ORDER_QUEUE = "order.order";

    public static final String PAYMENT_QUEUE_LISTENER = "order.payment.queue";
    public static final String ORDER_QUEUE_LISTENER = "order.order.queue";
}
