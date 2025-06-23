package com.example.choviet.service;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class RedisService {
    @Autowired
    RedisTemplate<String, Object> redisTemplate;

    public boolean isKeyExists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void set(String key, Object value, Long time, TimeUnit timeUnit){
        redisTemplate.opsForValue().set(key, value, time, timeUnit);
    }

    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }



    public void delete(String key){
        redisTemplate.delete(key);
    }

    public Long getTTLInDay(String key) {
        return redisTemplate.getExpire(key, TimeUnit.DAYS); // Trả về TTL tính bằng giây
    }
}
