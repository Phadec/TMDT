package com.example.user_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConditionalOnProperty(name = "spring.rabbitmq.enabled", havingValue = "true", matchIfMissing = true)
public class RabbitMQConfig {
    private static final Logger logger = LoggerFactory.getLogger(RabbitMQConfig.class);
    
    @Value("${spring.rabbitmq.host:localhost}")
    private String host;
    
    @Value("${spring.rabbitmq.port:5672}")
    private int port;
    
    @Value("${spring.rabbitmq.username:guest}")
    private String username;
    
    @Value("${spring.rabbitmq.password:guest}")
    private String password;
    
    @Value("${spring.rabbitmq.connection-timeout:5000}")
    private int connectionTimeout;

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }
    
    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory connectionFactory = new CachingConnectionFactory();
        connectionFactory.setHost(host);
        connectionFactory.setPort(port);
        connectionFactory.setUsername(username);
        connectionFactory.setPassword(password);
        connectionFactory.setConnectionTimeout(connectionTimeout);
        return connectionFactory;
    }

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();
        
        // Configure backoff policy
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(500);
        backOffPolicy.setMultiplier(2.0);
        backOffPolicy.setMaxInterval(10000);
        retryTemplate.setBackOffPolicy(backOffPolicy);
        
        // Configure retry policy with max attempts
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        return retryTemplate;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, 
                                        Jackson2JsonMessageConverter jsonMessageConverter,
                                        RetryTemplate retryTemplate) {
        try {
            RabbitTemplate template = new RabbitTemplate(connectionFactory);
            template.setMessageConverter(jsonMessageConverter);
            template.setRetryTemplate(retryTemplate);
            template.setMandatory(true);
            
            // Test connection
            template.afterPropertiesSet();
            logger.info("RabbitMQ connection established successfully");
            return template;
        } catch (Exception e) {
            logger.warn("Failed to establish RabbitMQ connection: {}. Using fallback.", e.getMessage());
            return new FallbackRabbitTemplate(connectionFactory, jsonMessageConverter);
        }
    }
    
    /**
     * Fallback implementation of RabbitTemplate that doesn't throw exceptions when messaging fails
     */
    private static class FallbackRabbitTemplate extends RabbitTemplate {
        private static final Logger fallbackLogger = LoggerFactory.getLogger(FallbackRabbitTemplate.class);
        
        public FallbackRabbitTemplate(ConnectionFactory connectionFactory, 
                                     Jackson2JsonMessageConverter jsonMessageConverter) {
            super(connectionFactory);
            setMessageConverter(jsonMessageConverter);
        }
        
        @Override
        public void convertAndSend(String exchange, String routingKey, Object object) {
            try {
                super.convertAndSend(exchange, routingKey, object);
            } catch (Exception e) {
                fallbackLogger.debug("Message not sent to RabbitMQ ({}): {}", e.getClass().getSimpleName(), e.getMessage());
            }
        }
        
        @Override
        public void convertAndSend(String routingKey, Object object) {
            try {
                super.convertAndSend(routingKey, object);
            } catch (Exception e) {
                fallbackLogger.debug("Message not sent to RabbitMQ ({}): {}", e.getClass().getSimpleName(), e.getMessage());
            }
        }
    }
}