package com.example.choviet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class RedisManagementService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * Lấy thông tin tổng quan về Redis
     */
    public Map<String, Object> getRedisInfo() {
        Map<String, Object> info = new HashMap<>();
        try {
            // Lấy thông tin cơ bản
            Set<String> keys = redisTemplate.keys("*");
            info.put("totalKeys", keys != null ? keys.size() : 0);
            info.put("usedMemory", "N/A"); // Có thể lấy từ Redis INFO command
            info.put("connectedClients", "N/A");
            info.put("uptime", "N/A");
            info.put("version", "N/A");
            
            return info;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get Redis info", e);
        }
    }

    /**
     * Tìm kiếm keys theo pattern với phân trang
     */
    public Map<String, Object> searchKeys(String pattern, int page, int size) {
        try {
            Set<String> allKeys = redisTemplate.keys(pattern);
            List<String> keysList = allKeys != null ? new ArrayList<>(allKeys) : new ArrayList<>();
            
            // Sắp xếp keys
            Collections.sort(keysList);
            
            // Phân trang
            int start = page * size;
            int end = Math.min(start + size, keysList.size());
            List<String> pageKeys = keysList.subList(start, end);
            
            // Lấy thông tin chi tiết cho mỗi key trong trang
            List<Map<String, Object>> keyInfos = pageKeys.stream()
                    .map(this::getKeyBasicInfo)
                    .collect(Collectors.toList());
            
            Map<String, Object> result = new HashMap<>();
            result.put("keys", keyInfos);
            result.put("totalKeys", keysList.size());
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (int) Math.ceil((double) keysList.size() / size));
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to search keys", e);
        }
    }

    /**
     * Lấy tất cả keys theo pattern
     */
    public Set<String> getAllKeys(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            return keys != null ? keys : new HashSet<>();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get all keys", e);
        }
    }

    /**
     * Lấy thông tin chi tiết của một key
     */
    public Map<String, Object> getKeyInfo(String key) {
        try {
            Map<String, Object> info = new HashMap<>();
            
            // Kiểm tra key có tồn tại không
            Boolean exists = redisTemplate.hasKey(key);
            info.put("exists", exists);
            
            if (Boolean.TRUE.equals(exists)) {
                // Lấy type
                String type = redisTemplate.type(key).code();
                info.put("type", type);
                
                // Lấy TTL
                Long ttl = redisTemplate.getExpire(key);
                info.put("ttl", ttl);
                
                // Lấy value (tùy theo type)
                Object value = redisTemplate.opsForValue().get(key);
                info.put("value", value);
                
                // Lấy size (nếu là collection)
                Long size = getKeySize(key, type);
                info.put("size", size);
            }
            
            return info;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get key info for: " + key, e);
        }
    }

    /**
     * Lấy thông tin cơ bản của key
     */
    private Map<String, Object> getKeyBasicInfo(String key) {
        Map<String, Object> info = new HashMap<>();
        info.put("key", key);
        
        try {
            String type = redisTemplate.type(key).code();
            info.put("type", type);
            
            Long ttl = redisTemplate.getExpire(key);
            info.put("ttl", ttl);
            
            Long size = getKeySize(key, type);
            info.put("size", size);
        } catch (Exception e) {
            info.put("type", "unknown");
            info.put("ttl", -1);
            info.put("size", 0);
        }
        
        return info;
    }

    /**
     * Lấy size của key tùy theo type
     */
    private Long getKeySize(String key, String type) {
        try {
            switch (type.toLowerCase()) {
                case "string":
                    return 1L;
                case "list":
                    return redisTemplate.opsForList().size(key);
                case "set":
                    return redisTemplate.opsForSet().size(key);
                case "zset":
                    return redisTemplate.opsForZSet().size(key);
                case "hash":
                    return redisTemplate.opsForHash().size(key);
                default:
                    return 0L;
            }
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Xóa một key
     */
    public Boolean deleteKey(String key) {
        try {
            return redisTemplate.delete(key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete key: " + key, e);
        }
    }

    /**
     * Xóa nhiều keys theo pattern
     */
    public Long deleteKeys(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                return redisTemplate.delete(keys);
            }
            return 0L;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete keys with pattern: " + pattern, e);
        }
    }

    /**
     * Set TTL cho key
     */
    public Boolean setExpire(String key, long timeout, TimeUnit unit) {
        try {
            return redisTemplate.expire(key, timeout, unit);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set expire for key: " + key, e);
        }
    }

    /**
     * Set value cho key
     */
    public void setValue(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set value for key: " + key, e);
        }
    }

    /**
     * Set value cho key với TTL
     */
    public void setValue(String key, Object value, long timeout, TimeUnit unit) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout, unit);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set value with timeout for key: " + key, e);
        }
    }

    /**
     * Flush current database
     */
    public void flushCurrentDb() {
        try {
            redisTemplate.getConnectionFactory().getConnection().flushDb();
        } catch (Exception e) {
            throw new RuntimeException("Failed to flush current database", e);
        }
    }
}
