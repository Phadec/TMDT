package com.example.choviet.repository;

import com.example.choviet.entity.Images;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends MongoRepository<Images, String> {
}
