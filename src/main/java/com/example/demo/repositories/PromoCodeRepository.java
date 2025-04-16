package com.example.demo.repositories;

import com.example.demo.models.PromoCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends MongoRepository<PromoCode, String> {
    Optional<PromoCode> findByCodeAndIsActiveTrue(String code);
    List<PromoCode> findByIsActiveTrue();
    List<PromoCode> findByIsActiveTrueOrderByValidToAsc();
}
