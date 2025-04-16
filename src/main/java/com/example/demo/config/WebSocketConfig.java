package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker
        config.enableSimpleBroker("/topic", "/queue", "/user");
        
        // Set prefix for controller endpoint methods
        config.setApplicationDestinationPrefixes("/app");
        
        // Configure user destination prefix
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint, enabling SockJS fallback options
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setSuppressCors(true); // Fixed: Correct method name is setSuppressCors (with two 'p's)
    }
    
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        // Configure larger message sizes if needed for image sharing
        registration.setMessageSizeLimit(8192 * 8192);    // Message buffer size limit
        registration.setSendBufferSizeLimit(8192 * 8192); // Client send buffer size
        registration.setSendTimeLimit(20000);             // Send timeout in milliseconds
    }
}
