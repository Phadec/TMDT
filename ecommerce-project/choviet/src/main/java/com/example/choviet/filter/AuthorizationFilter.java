package com.example.choviet.filter;

import com.example.choviet.config.PermissionConfig;
import com.example.choviet.dto.AuthResponse;
import com.example.choviet.entity.Role;
import com.example.choviet.entity.User;
import com.example.choviet.service.AuthService;
import com.example.choviet.service.CustomerService;
import com.example.choviet.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Auth.*;
import static com.example.choviet.config.api.suffix.Order.*;
import static com.example.choviet.config.api.suffix.Product.*;
import static com.example.choviet.config.api.suffix.Verify.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
@Component
public class AuthorizationFilter implements Filter {

    @Autowired
    private PermissionConfig permissionConfig;
    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private CustomerService customerService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        // Skip authorization for login, register, and public endpoints
        if (isPublicEndpoint(path)) {
            chain.doFilter(request, response);
            return;
        }

        try {
            // Extract token from Authorization header
            String token = extractToken(httpRequest);
            if (!StringUtils.hasText(token)) {
                sendUnauthorizedResponse(httpResponse, "Missing authorization token");
                return;
            }

            // Determine if it's user or customer based on endpoint
            boolean isUserEndpoint = isUserEndpoint(path);
            boolean isCustomerEndpoint = isCustomerEndpoint(path);

            if (isUserEndpoint) {
                // Validate user token and check permissions
                AuthResponse user = authService.validateTokenUser(token);
                if (user == null) {
                    sendUnauthorizedResponse(httpResponse, "Invalid or expired token");
                    return;
                }
                
                // Check permission for the requested resource and action
                String[] resourceAction = extractResource(path);
                if (resourceAction != null) {
                    String resource = resourceAction[0];

                    if (!permissionConfig.hasPermission(user.getRoleName().toString(), resource, method)) {
                        sendForbiddenResponse(httpResponse, "Insufficient permissions");
                        return;
                    }
                }

                // Add user to request attributes for controllers to use
                httpRequest.setAttribute("currentUser", user);

            } else if (isCustomerEndpoint) {
                // Validate customer token
                AuthResponse customer = authService.validateTokenCustomer(token);
                if (customer == null) {
                    sendUnauthorizedResponse(httpResponse, "Invalid or expired customer token");
                    return;
                }

                // Add customer to request attributes for controllers to use
                httpRequest.setAttribute("currentCustomer", customer);
            }

            chain.doFilter(request, response);

        } catch (Exception e) {
            sendUnauthorizedResponse(httpResponse, "Authorization failed: " + e.getMessage());
        }
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith(CLIENT + AUTH) ||
                path.startsWith(CLIENT + ORDER) ||
                path.startsWith(CLIENT + PRODUCT) ||
                path.startsWith(COMMON + AUTH) ||
                path.startsWith(COMMON + PRODUCT) ||
                path.startsWith(COMMON + VERIFY) ||
                path.startsWith(ADMIN + AUTH + LOGIN);
    }

    private boolean isUserEndpoint(String path) {
        return path.startsWith(ADMIN + USER) ||
                path.startsWith(ADMIN + CUSTOMER) ||
                path.startsWith(ADMIN + ORDER) ||
                path.startsWith(ADMIN + PRODUCT) ||
                path.startsWith(ADMIN + AUTH);
    }
    private boolean isCustomerEndpoint(String path) {
        return path.startsWith(CLIENT + AUTH) ||
                path.startsWith(CLIENT + ORDER) ||
                path.startsWith(CLIENT + PRODUCT);
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String[] extractResource(String path) {
        // Extract resource from path
        String resource = extractResourceFromPath(path);
        if (resource == null) {
            return null;
        }

        return new String[]{resource};
    }

    private String extractResourceFromPath(String path) {
        String[] segments = path.split("/");
        if (segments.length >= 4) {
            String resource = segments[4];

            if (resource.endsWith("s")) {
                resource = resource.substring(0, resource.length() - 1);
            }
            return resource;
        }

        return null;
    }

    private void sendUnauthorizedResponse(HttpServletResponse response, String message)
            throws IOException {
        sendErrorResponse(response, HttpStatus.UNAUTHORIZED, message);
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message)
            throws IOException {
        sendErrorResponse(response, HttpStatus.FORBIDDEN, message);
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", status.getReasonPhrase());
        errorResponse.put("message", message);
        errorResponse.put("status", status.value());
        errorResponse.put("timestamp", System.currentTimeMillis());

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        response.getWriter().flush();
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization logic if needed
    }

    @Override
    public void destroy() {
        // Cleanup logic if needed
    }
}