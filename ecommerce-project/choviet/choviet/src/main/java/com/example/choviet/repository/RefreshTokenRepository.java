package com.example.choviet.repository;
import com.example.choviet.entity.RefreshToken;
import com.example.choviet.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    // Lấy tất cả token của user
    List<RefreshToken> findAllByUser(User user);
    // Lấy tất cả token đã bị vô hiệu hóa
    List<RefreshToken> findAllByValidFalse();
}
