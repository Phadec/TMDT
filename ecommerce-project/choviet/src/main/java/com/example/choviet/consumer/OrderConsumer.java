package com.example.choviet.consumer;

import com.example.choviet.dto.OrderEvent;
import com.example.choviet.dto.ProductEvent;
import com.example.choviet.repository.OrderRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static com.example.choviet.config.ConfigTopicOrder.*;

@Component
public class OrderConsumer {
    @Autowired
    private OrderRepository orderRepository;

    @RabbitListener(queues = ORDER_QUEUE_LISTENER)
    public void handleLoginEvent(OrderEvent event) {
        if(event == null) {
            System.out.println("Order is null");
            return;
        }

        orderRepository.save(event.getOrder());
        System.out.println("Saved order " + event.getOrder());
    }
}
