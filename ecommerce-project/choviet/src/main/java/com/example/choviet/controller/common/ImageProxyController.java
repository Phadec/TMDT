package com.example.choviet.controller.common;

import com.example.choviet.dto.ApiResponse;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import static com.example.choviet.config.Code.OK;
import static com.example.choviet.config.api.Mid.IMAGE_PROXY;
import static com.example.choviet.config.api.Prefix.COMMON;
import static com.example.choviet.config.api.suffix.ImageProxy.GET_IMAGE;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(COMMON + IMAGE_PROXY)
public class ImageProxyController {

    final RestTemplate restTemplate = new RestTemplate();

    @GetMapping(GET_IMAGE)
    public ResponseEntity<byte[]> proxyImage(@RequestParam("url") String encodedUrl) {
        try {
            // Decode the URL
            String imageUrl = URLDecoder.decode(encodedUrl, StandardCharsets.UTF_8.toString());
            
            // Fetch the image from the external URL
            ResponseEntity<byte[]> response = restTemplate.getForEntity(imageUrl, byte[].class);
            
            // Create headers for our response
            HttpHeaders headers = new HttpHeaders();
            
            // Copy content type from original response if available
            MediaType contentType = response.getHeaders().getContentType();
            if (contentType != null) {
                headers.setContentType(contentType);
            } else {
                // Default to image/jpeg if content type is not available
                headers.setContentType(MediaType.IMAGE_JPEG);
            }
            
            // Set cache control headers to improve performance
            headers.setCacheControl("public, max-age=86400"); // Cache for 1 day
            
            // Return the image with appropriate headers
            return new ResponseEntity<>(response.getBody(), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}