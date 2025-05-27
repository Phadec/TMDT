package com.example.choviet.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static com.example.choviet.config.Constants.*;

@Configuration
public class RabbitMQConfig {

    // Tạo exchange cho user
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE, true, false);
    }

    // Các queue và binding cho user
    @Bean
    public Queue loginQueue() {
        return new Queue(LOGIN_QUEUE_LISTENER, true);
    }

    @Bean
    public Queue registerQueue() {
        return new Queue(REGISTER_QUEUE_LISTENER, true);
    }

    @Bean
    public Queue logoutQueue() {
        return new Queue(LOGOUT_QUEUE_LISTENER, true);
    }

    @Bean
    public Queue verifyEmailQueue() {
        return new Queue(VERIFY_EMAIL_QUEUE_LISTENER, true);
    }

    @Bean
    public Queue changePasswordQueue() {
        return new Queue(CHANGE_PASSWORD_QUEUE_LISTENER, true);
    }

    @Bean
    public Queue forgotPasswordQueue() {
        return new Queue(FORGOT_PASSWORD_QUEUE_LISTENER, true);
    }

    @Bean
    public Binding loginBinding() {
        return BindingBuilder.bind(loginQueue()).to(userExchange()).with(LOGIN_QUEUE);
    }

    @Bean
    public Binding registerBinding() {
        return BindingBuilder.bind(registerQueue()).to(userExchange()).with(REGISTER_QUEUE);
    }

    @Bean
    public Binding logoutBinding() {
        return BindingBuilder.bind(logoutQueue()).to(userExchange()).with(LOGOUT_QUEUE);
    }

    @Bean
    public Binding verifyEmailBinding() {
        return BindingBuilder.bind(verifyEmailQueue()).to(userExchange()).with(VERIFY_EMAIL_QUEUE);
    }

    @Bean
    public Binding changePasswordBinding() {
        return BindingBuilder.bind(changePasswordQueue()).to(userExchange()).with(CHANGE_PASSWORD_QUEUE);
    }

    @Bean
    public Binding forgotPasswordBinding() {
        return BindingBuilder.bind(forgotPasswordQueue()).to(userExchange()).with(FORGOT_PASSWORD_QUEUE);
    }

    // Tạo exchange cho order
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE, true, false);
    }

    // Các queue và binding cho order
    @Bean
    public Queue paymentQueue() {
        return new Queue(PAYMENT_QUEUE_LISTENER, true);
    }

    @Bean
    public Queue orderQueue() {
        return new Queue(ORDER_QUEUE_LISTENER, true);
    }

    @Bean
    public Binding paymentBinding() {
        return BindingBuilder.bind(paymentQueue()).to(orderExchange()).with(PAYMENT_QUEUE);
    }

    @Bean
    public Binding orderBinding() {
        return BindingBuilder.bind(orderQueue()).to(orderExchange()).with(ORDER_QUEUE);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}