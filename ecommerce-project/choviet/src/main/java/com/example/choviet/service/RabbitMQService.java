package com.example.choviet.service;
import com.example.choviet.dto.Event;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class RabbitMQService {
    @Autowired
    RabbitTemplate rabbitTemplate;

    @Async
    // đẩy vào queue của rabbitmq
    public void pushToQueue(Event<?> event, String exchange, String queue){
        rabbitTemplate.convertAndSend(exchange, queue, event);
    }
}
