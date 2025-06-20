package com.example.choviet.transformer;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Lớp TextEmbedding chuyển đổi văn bản thành vector nhúng
 * sử dụng phương pháp TF-IDF đơn giản
 */
public class TextEmbedding {
    private final Map<String, Integer> vocabulary;
    private final int dimensions;
    
    /**
     * Khởi tạo với kích thước từ điển cố định
     * @param dimensions Số chiều của vector nhúng
     */
    public TextEmbedding(int dimensions) {
        this.vocabulary = new HashMap<>();
        this.dimensions = dimensions;
    }
    
    /**
     * Tiền xử lý văn bản: chuyển thành chữ thường, loại bỏ dấu câu, tách từ
     * @param text Văn bản cần xử lý
     * @return Mảng các từ đã được xử lý
     */
    private String[] preprocessText(String text) {
        if (text == null) return new String[0];
        
        // Chuyển thành chữ thường và loại bỏ dấu câu
        String processed = text.toLowerCase()
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        
        // Tách từ
        return processed.split("\\s+");
    }
    
    /**
     * Tính toán vector TF-IDF đơn giản cho văn bản
     * @param text Văn bản cần chuyển đổi
     * @return Vector nhúng
     */
    public double[] getEmbedding(String text) {
        String[] words = preprocessText(text);
        double[] embedding = new double[dimensions];
        Arrays.fill(embedding, 0.0);
        
        if (words.length == 0) return embedding;
        
        // Tính tần suất từ
        Map<String, Integer> wordFreq = new HashMap<>();
        for (String word : words) {
            wordFreq.put(word, wordFreq.getOrDefault(word, 0) + 1);
            
            // Cập nhật từ điển
            if (!vocabulary.containsKey(word)) {
                if (vocabulary.size() < dimensions) {
                    vocabulary.put(word, vocabulary.size());
                }
            }
        }
        
        // Tạo vector nhúng dựa trên tần suất từ
        for (Map.Entry<String, Integer> entry : wordFreq.entrySet()) {
            String word = entry.getKey();
            int freq = entry.getValue();
            
            if (vocabulary.containsKey(word)) {
                int index = vocabulary.get(word);
                if (index < dimensions) {
                    // Tính TF (Term Frequency)
                    double tf = (double) freq / words.length;
                    embedding[index] = tf;
                }
            }
        }
        
        return embedding;
    }
    
    /**
     * Tính độ tương đồng cosine giữa hai vector
     * @param vec1 Vector thứ nhất
     * @param vec2 Vector thứ hai
     * @return Độ tương đồng cosine (0-1)
     */
    public static double cosineSimilarity(double[] vec1, double[] vec2) {
        if (vec1.length != vec2.length) {
            throw new IllegalArgumentException("Vectors must have the same dimensions");
        }
        
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        
        for (int i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += Math.pow(vec1[i], 2);
            norm2 += Math.pow(vec2[i], 2);
        }
        
        // Tránh chia cho 0
        if (norm1 == 0 || norm2 == 0) {
            return 0.0;
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}