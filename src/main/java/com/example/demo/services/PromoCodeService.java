package com.example.demo.services;

import com.example.demo.models.PromoCode;
import com.example.demo.repositories.PromoCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PromoCodeService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    public List<PromoCode> getAllPromoCodes() {
        return promoCodeRepository.findAll();
    }

    public List<PromoCode> getActivePromoCodes() {
        return promoCodeRepository.findByIsActiveTrueOrderByValidToAsc();
    }

    public PromoCode getPromoCodeById(String id) {
        return promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không tồn tại"));
    }

    public PromoCode createPromoCode(PromoCode promoCode) {
        promoCode.setUsageCount(0);
        return promoCodeRepository.save(promoCode);
    }

    public PromoCode updatePromoCode(String id, PromoCode promoCodeDetails) {
        PromoCode promoCode = getPromoCodeById(id);

        if (promoCodeDetails.getCode() != null) {
            promoCode.setCode(promoCodeDetails.getCode());
        }
        if (promoCodeDetails.getDescription() != null) {
            promoCode.setDescription(promoCodeDetails.getDescription());
        }
        if (promoCodeDetails.getDiscountAmount() > 0) {
            promoCode.setDiscountAmount(promoCodeDetails.getDiscountAmount());
        }
        if (promoCodeDetails.getDiscountPercent() > 0) {
            promoCode.setDiscountPercent(promoCodeDetails.getDiscountPercent());
        }
        if (promoCodeDetails.getMinimumPurchase() > 0) {
            promoCode.setMinimumPurchase(promoCodeDetails.getMinimumPurchase());
        }
        if (promoCodeDetails.getValidFrom() != null) {
            promoCode.setValidFrom(promoCodeDetails.getValidFrom());
        }
        if (promoCodeDetails.getValidTo() != null) {
            promoCode.setValidTo(promoCodeDetails.getValidTo());
        }
        if (promoCodeDetails.getUsageLimit() > 0) {
            promoCode.setUsageLimit(promoCodeDetails.getUsageLimit());
        }

        return promoCodeRepository.save(promoCode);
    }

    public boolean deletePromoCode(String id) {
        PromoCode promoCode = getPromoCodeById(id);
        promoCodeRepository.delete(promoCode);
        return true;
    }

    public PromoCode validatePromoCode(String code, double cartTotal) {
        Optional<PromoCode> promoOptional = promoCodeRepository.findByCodeAndIsActiveTrue(code);

        if (promoOptional.isEmpty()) {
            throw new RuntimeException("Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
        }

        PromoCode promoCode = promoOptional.get();
        Date now = new Date();

        // Check validity period
        if (promoCode.getValidFrom() != null && now.before(promoCode.getValidFrom())) {
            throw new RuntimeException("Mã khuyến mãi chưa bắt đầu có hiệu lực");
        }

        if (promoCode.getValidTo() != null && now.after(promoCode.getValidTo())) {
            throw new RuntimeException("Mã khuyến mãi đã hết hạn");
        }

        // Check usage limit
        if (promoCode.getUsageLimit() > 0 && promoCode.getUsageCount() >= promoCode.getUsageLimit()) {
            throw new RuntimeException("Mã khuyến mãi đã đạt giới hạn sử dụng");
        }

        // Check minimum purchase against total cart value
        if (cartTotal < promoCode.getMinimumPurchase()) {
            throw new RuntimeException("Giá trị đơn hàng chưa đạt giá trị tối thiểu " + 
                formatCurrency(promoCode.getMinimumPurchase()) + " để áp dụng mã khuyến mãi");
        }

        return promoCode;
    }

    public double applyPromoCode(String code, double cartTotal) {
        PromoCode promoCode = validatePromoCode(code, cartTotal);
        double discount = promoCode.calculateDiscount(cartTotal);

        // Increment usage count
        promoCode.incrementUsage();
        promoCodeRepository.save(promoCode);

        return discount;
    }

    // Helper method to format currency for error messages
    private String formatCurrency(double amount) {
        return String.format("%,.0f₫", amount);
    }

    public void createSamplePromoCodes() {
        // Check if we already have promo codes
        if (promoCodeRepository.count() > 0) {
            System.out.println("Sample promo codes already exist. Skipping creation.");
            return;
        }

        System.out.println("Creating sample promo codes...");

        // Create calendar for date operations
        Calendar calendar = Calendar.getInstance();
        Date now = calendar.getTime();

        // WELCOME10 - 10% off, no minimum, valid for 30 days
        PromoCode welcome10 = new PromoCode();
        welcome10.setCode("WELCOME10");
        welcome10.setDescription("Giảm 10% tổng giá trị đơn hàng cho khách hàng mới");
        welcome10.setDiscountPercent(10);
        welcome10.setDiscountAmount(0);
        welcome10.setMinimumPurchase(0);
        welcome10.setValidFrom(now);
        calendar.add(Calendar.DATE, 30);
        welcome10.setValidTo(calendar.getTime());
        welcome10.setUsageLimit(100);
        welcome10.setActive(true);

        // SUMMER20 - 20% off, minimum 500k VND, valid for 15 days
        calendar.setTime(now);
        PromoCode summer20 = new PromoCode();
        summer20.setCode("SUMMER20");
        summer20.setDescription("Giảm 20% cho đơn hàng từ 500.000đ");
        summer20.setDiscountPercent(20);
        summer20.setDiscountAmount(0);
        summer20.setMinimumPurchase(500000);
        summer20.setValidFrom(now);
        calendar.add(Calendar.DATE, 15);
        summer20.setValidTo(calendar.getTime());
        summer20.setUsageLimit(50);
        summer20.setActive(true);

        // FREESHIP - 30k off, minimum 300k VND, valid for 7 days
        calendar.setTime(now);
        PromoCode freeship = new PromoCode();
        freeship.setCode("FREESHIP");
        freeship.setDescription("Giảm 30.000đ phí vận chuyển cho đơn hàng từ 300.000đ");
        freeship.setDiscountPercent(0);
        freeship.setDiscountAmount(30000);
        freeship.setMinimumPurchase(300000);
        freeship.setValidFrom(now);
        calendar.add(Calendar.DATE, 7);
        freeship.setValidTo(calendar.getTime());
        freeship.setUsageLimit(200);
        freeship.setActive(true);

        // FLASH50 - 50k off, minimum 200k VND, valid for 1 day
        calendar.setTime(now);
        PromoCode flash50 = new PromoCode();
        flash50.setCode("FLASH50");
        flash50.setDescription("Giảm ngay 50.000đ cho đơn hàng từ 200.000đ - Chỉ áp dụng trong hôm nay");
        flash50.setDiscountPercent(0);
        flash50.setDiscountAmount(50000);
        flash50.setMinimumPurchase(200000);
        flash50.setValidFrom(now);
        calendar.add(Calendar.DATE, 1);
        flash50.setValidTo(calendar.getTime());
        flash50.setUsageLimit(30);
        flash50.setActive(true);

        // NEWUSER - 15% off, max 100k VND, no expiry
        PromoCode newUser = new PromoCode();
        newUser.setCode("NEWUSER");
        newUser.setDescription("Giảm 15% tối đa 100.000đ cho khách hàng mới");
        newUser.setDiscountPercent(15);
        newUser.setDiscountAmount(100000); // Max discount
        newUser.setMinimumPurchase(0);
        newUser.setValidFrom(now);
        // No expiry date for this code
        newUser.setUsageLimit(0); // Unlimited usage
        newUser.setActive(true);

        // Save all promo codes
        promoCodeRepository.save(welcome10);
        promoCodeRepository.save(summer20);
        promoCodeRepository.save(freeship);
        promoCodeRepository.save(flash50);
        promoCodeRepository.save(newUser);

        System.out.println("Sample promo codes created successfully.");
    }
}
