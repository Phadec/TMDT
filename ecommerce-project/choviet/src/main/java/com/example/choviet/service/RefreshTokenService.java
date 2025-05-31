package com.example.choviet.service;

import com.example.choviet.entity.Customer;
import com.example.choviet.entity.RefreshToken;
import com.example.choviet.entity.User;
import com.example.choviet.repository.RefreshTokenRepository;
import com.example.choviet.repository.UserRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class RefreshTokenService {
    @Value("${jwt.refresh-token.expiration:86400000}") // 24 hours in milliseconds by default
    Long refreshTokenDurationMs;

    @Autowired
    RefreshTokenRepository refreshTokenRepository;

    @Autowired
    UserRepository userRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public void deleteAllInvalidatedTokens() {
        List<RefreshToken> invalidTokens = refreshTokenRepository.findAllByValidFalse();
        refreshTokenRepository.deleteAll(invalidTokens);
    }

    @Transactional
    public RefreshToken createRefreshToken(String userId) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(null);

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
            return null;
        }

        if (!token.isValid()) {
            return null;
        }

        return token;
    }

    @Transactional
    public void invalidateToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(null);

        refreshToken.setValid(false);
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void invalidateAllUserTokens(User user) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser(user);
        for (RefreshToken token : tokens) {
            token.setValid(false);
        }
        refreshTokenRepository.saveAll(tokens);
    }

    @Transactional
    public void invalidateAllCustomerTokens(Customer customer) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByCustomer(customer);
        for (RefreshToken token : tokens) {
            token.setValid(false);
        }
        refreshTokenRepository.saveAll(tokens);
    }

    // Clean up expired and invalidated tokens daily
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        deleteAllInvalidatedTokens();
    }
}

