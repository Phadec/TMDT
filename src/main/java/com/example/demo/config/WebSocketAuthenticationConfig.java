package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketAuthenticationConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extract the JWT token from the headers
                    String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                        String token = authorizationHeader.substring(7);
                        
                        try {
                            if (jwtTokenProvider.validateToken(token)) {
                                String username = jwtTokenProvider.getUsernameFromToken(token);
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                
                                Authentication auth = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                                
                                SecurityContextHolder.getContext().setAuthentication(auth);
                                accessor.setUser(auth);
                                
                                System.out.println("WebSocket authenticated user: " + username);
                            } else {
                                System.out.println("Invalid JWT token in WebSocket connection");
                            }
                        } catch (Exception e) {
                            System.err.println("WebSocket authentication error: " + e.getMessage());
                        }
                    } else {
                        System.out.println("WebSocket connection without authentication");
                    }
                }
                
                return message;
            }
        });
    }
}
