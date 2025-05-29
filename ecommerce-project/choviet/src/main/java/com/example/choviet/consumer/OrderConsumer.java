package com.example.choviet.consumer;
import com.example.choviet.dto.Event;
import com.example.choviet.entity.Order;
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
    public void handleLoginEvent(Event<Order> event) {
        if(event == null) {
            System.out.println("Order is null");
            return;
        }

        orderRepository.save(event.getData());
        System.out.println("Saved order " + event.getData());
    }
}
