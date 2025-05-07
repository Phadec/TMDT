package com.example.user_service.service;

import com.example.user_service.entity.RefreshToken;
import com.example.user_service.entity.User;
import com.example.user_service.exception.TokenRefreshException;
import com.example.user_service.repository.RefreshTokenRepository;
import com.example.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Value("${jwt.refresh-token.expiration:86400000}") // 24 hours in milliseconds by default
    private Long refreshTokenDurationMs;
    
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }
    
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new TokenRefreshException("User not found with id " + userId));
        
        // Invalidate any existing tokens for this user
        invalidateAllUserTokens(user);
        
        // Create a new refresh token
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setValid(true);
        
        // Save and return the refresh token
        return refreshTokenRepository.save(refreshToken);
    }
    
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token was expired. Please make a new login request");
        }
        
        if (!token.isValid()) {
            throw new TokenRefreshException("Refresh token was invalidated. Possible security breach detected");
        }
        
        return token;
    }
    
    @Transactional
    public void invalidateToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));
                
        refreshToken.setValid(false);
        refreshTokenRepository.save(refreshToken);
    }
    
    @Transactional
    public void invalidateAllUserTokens(User user) {
        refreshTokenRepository.invalidateAllUserTokens(user);
    }
    
    // Clean up expired and invalidated tokens daily
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteAllInvalidatedTokens();
    }
}
