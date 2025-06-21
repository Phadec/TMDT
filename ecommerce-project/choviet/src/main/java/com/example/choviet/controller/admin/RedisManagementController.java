package com.example.choviet.controller.admin;

import com.example.choviet.service.RedisManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/admin/redis")
@CrossOrigin(origins = {"http://localhost:8080", "http://127.0.0.1:8080"}, allowCredentials = "false")
public class RedisManagementController {

    @Autowired
    private RedisManagementService redisManagementService;

    /**
     * Lấy thông tin tổng quan về Redis
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getRedisInfo() {
        try {
            Map<String, Object> info = redisManagementService.getRedisInfo();
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Tìm kiếm keys theo pattern
     */
    @GetMapping("/keys")
    public ResponseEntity<Map<String, Object>> searchKeys(
            @RequestParam(defaultValue = "*") String pattern,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Map<String, Object> result = redisManagementService.searchKeys(pattern, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy tất cả keys theo pattern
     */
    @GetMapping("/keys/all")
    public ResponseEntity<Set<String>> getAllKeys(@RequestParam(defaultValue = "*") String pattern) {
        try {
            Set<String> keys = redisManagementService.getAllKeys(pattern);
            return ResponseEntity.ok(keys);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lấy thông tin chi tiết của một key
     */
    @GetMapping("/key/{key}")
    public ResponseEntity<Map<String, Object>> getKeyInfo(@PathVariable String key) {
        try {
            Map<String, Object> info = redisManagementService.getKeyInfo(key);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Xóa một key
     */
    @DeleteMapping("/key/{key}")
    public ResponseEntity<Map<String, Object>> deleteKey(@PathVariable String key) {
        try {
            Boolean deleted = redisManagementService.deleteKey(key);
            Map<String, Object> response = Map.of("success", deleted, "key", key);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Xóa nhiều keys theo pattern
     */
    @DeleteMapping("/keys")
    public ResponseEntity<Map<String, Object>> deleteKeys(@RequestParam String pattern) {
        try {
            Long deletedCount = redisManagementService.deleteKeys(pattern);
            Map<String, Object> response = Map.of("success", true, "deletedCount", deletedCount, "pattern", pattern);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Set TTL cho một key
     */
    @PutMapping("/key/{key}/expire")
    public ResponseEntity<Map<String, Object>> setExpire(
            @PathVariable String key,
            @RequestParam long timeout,
            @RequestParam(defaultValue = "SECONDS") String unit) {
        try {
            TimeUnit timeUnit = TimeUnit.valueOf(unit.toUpperCase());
            Boolean success = redisManagementService.setExpire(key, timeout, timeUnit);
            Map<String, Object> response = Map.of("success", success, "key", key, "timeout", timeout, "unit", unit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Set value cho một key
     */
    @PutMapping("/key/{key}")
    public ResponseEntity<Map<String, Object>> setValue(
            @PathVariable String key,
            @RequestBody Map<String, Object> request) {
        try {
            Object value = request.get("value");
            Object timeout = request.get("timeout");
            String unit = (String) request.get("unit");
            
            if (timeout != null && unit != null) {
                TimeUnit timeUnit = TimeUnit.valueOf(unit.toUpperCase());
                long timeoutValue = Long.parseLong(timeout.toString());
                redisManagementService.setValue(key, value, timeoutValue, timeUnit);
            } else {
                redisManagementService.setValue(key, value);
            }
            
            Map<String, Object> response = Map.of("success", true, "key", key, "value", value);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Flush tất cả keys trong database hiện tại
     */
    @DeleteMapping("/flush")
    public ResponseEntity<Map<String, Object>> flushCurrentDb() {
        try {
            redisManagementService.flushCurrentDb();
            Map<String, Object> response = Map.of("success", true, "message", "All keys flushed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
