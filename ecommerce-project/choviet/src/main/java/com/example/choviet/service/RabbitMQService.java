package com.example.choviet.service;
import com.example.choviet.dto.Event;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQService {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Async
    // đẩy vào queue của rabbitmq
    public void pushToQueue(Event<?> event, String exchange, String queue){
        rabbitTemplate.convertAndSend(exchange, queue, event);
    }
}
