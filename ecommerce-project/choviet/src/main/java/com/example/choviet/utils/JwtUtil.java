package com.example.choviet.utils;

import com.example.choviet.dto.AuthResponse;
import com.example.choviet.entity.User;
import com.example.choviet.entity.Customer;
import com.example.choviet.repository.UserRepository;
import com.example.choviet.repository.CustomerRepository;
import com.example.choviet.service.RedisService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret:myVeryLongSecretKeyThatIsAtLeast32CharactersLongForHS256Algorithm}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600000}") // 1 hour in milliseconds
    private Long jwtExpirationMs;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private RedisService redisService;

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes())) // Thay thế setSigningKey()
                    .build()
                    .parseClaimsJws(token)
                    .getPayload(); // Thay thế getBody()
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
            throw e;
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            throw e;
        } catch (JwtException e) { // Thay thế SignatureException
            logger.error("Invalid JWT signature: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
            throw e;
        }
    }

    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    public Boolean isTokenBlacklisted(String token) {
        return redisService.isKeyExists("blacklist:" + token);
    }

    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, email);
    }

    public String generateTokenWithRole(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public AuthResponse validateTokenUser(String token) {
        try {
            // Check if token is blacklisted
            if (isTokenBlacklisted(token)) {
                return null;
            }
            
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes())) // Thay thế setSigningKey()
                    .build()
                    .parseClaimsJws(token)
                    .getPayload();
            String email = claims.getSubject();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null && user.getStatus().equals(User.Status.ACTIVE)) {
                AuthResponse response = new AuthResponse();
                response.setRoleName(user.getRole().getRoleName());
                return response;
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return null;
    }
    
    public AuthResponse validateTokenCustomer(String token) {
        try {
            // Check if token is blacklisted
            if (isTokenBlacklisted(token)) {
                return null;
            }
            
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getPayload();
            String email = claims.getSubject();
            Customer customer = customerRepository.findByEmail(email).orElse(null);
            if (customer != null && customer.getStatus().equals(Customer.Status.ACTIVE)) {
                AuthResponse response = new AuthResponse();
                response.setEmail(customer.getEmail());
                response.setUserType("CUSTOMER");
                return response;
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return null;
    }
}