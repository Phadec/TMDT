package com.example.choviet.repository;

import com.example.choviet.entity.Settings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingsRepository extends MongoRepository<Settings, String> {
    
    /**
     * Tìm cài đặt đầu tiên (chỉ có một bản ghi cài đặt duy nhất)
     */
    Optional<Settings> findFirstByOrderByCreatedAtDesc();
    
    /**
     * Kiểm tra xem có cài đặt nào tồn tại không
     */
    boolean existsByIdIsNotNull();
}