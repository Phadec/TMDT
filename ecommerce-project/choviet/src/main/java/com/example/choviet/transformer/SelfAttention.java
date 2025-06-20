package com.example.choviet.transformer;

/**
 * Lớp SelfAttention thực hiện cơ chế tự chú ý (self-attention)
 * để tăng cường các đặc trưng quan trọng trong vector nhúng
 */
public class SelfAttention {
    private final int dimensions;
    
    /**
     * Khởi tạo với kích thước vector
     * @param dimensions Số chiều của vector
     */
    public SelfAttention(int dimensions) {
        this.dimensions = dimensions;
    }
    
    /**
     * Áp dụng cơ chế tự chú ý lên vector nhúng
     * @param embedding Vector nhúng đầu vào
     * @return Vector nhúng đã được tăng cường
     */
    public double[] applyAttention(double[] embedding) {
        if (embedding.length != dimensions) {
            throw new IllegalArgumentException("Embedding dimensions mismatch");
        }
        
        // Tính toán trọng số chú ý
        double[] attentionWeights = calculateAttentionWeights(embedding);
        
        // Áp dụng trọng số chú ý
        double[] enhancedEmbedding = new double[dimensions];
        for (int i = 0; i < dimensions; i++) {
            enhancedEmbedding[i] = embedding[i] * attentionWeights[i];
        }
        
        return enhancedEmbedding;
    }
    
    /**
     * Tính toán trọng số chú ý dựa trên giá trị của vector
     * @param embedding Vector nhúng
     * @return Trọng số chú ý
     */
    private double[] calculateAttentionWeights(double[] embedding) {
        double[] weights = new double[dimensions];
        
        // Tính tổng bình phương để chuẩn hóa
        double sumSquared = 0.0;
        for (int i = 0; i < dimensions; i++) {
            sumSquared += Math.pow(embedding[i], 2);
        }
        
        // Tránh chia cho 0
        if (sumSquared == 0) {
            // Trả về trọng số đồng đều nếu vector toàn 0
            for (int i = 0; i < dimensions; i++) {
                weights[i] = 1.0 / dimensions;
            }
            return weights;
        }
        
        // Tính trọng số chú ý dựa trên giá trị tương đối
        for (int i = 0; i < dimensions; i++) {
            // Softmax đơn giản: exp(x_i) / sum(exp(x_j))
            weights[i] = Math.pow(embedding[i], 2) / sumSquared;
        }
        
        return weights;
    }
}