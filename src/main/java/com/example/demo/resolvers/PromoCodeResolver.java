package com.example.demo.resolvers;

import com.example.demo.models.PromoCode;
import com.example.demo.services.PromoCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.text.ParseException;

@Controller
public class PromoCodeResolver {

    @Autowired
    private PromoCodeService promoCodeService;

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PromoCode> allPromoCodes() {
        return promoCodeService.getAllPromoCodes();
    }
    
    @QueryMapping
    public List<PromoCode> activePromoCodes() {
        return promoCodeService.getActivePromoCodes();
    }

    @QueryMapping
    public Map<String, Object> validatePromoCode(@Argument String code, @Argument double cartTotal) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("Validating promo code: " + code + " for cart total: " + cartTotal);
            PromoCode promoCode = promoCodeService.validatePromoCode(code, cartTotal);
            double discount = promoCode.calculateDiscount(cartTotal);
            
            System.out.println("Promo code valid: " + code);
            System.out.println("Discount calculated: " + discount);
            
            result.put("valid", true);
            result.put("code", promoCode.getCode());
            result.put("discount", discount);
            result.put("description", promoCode.getDescription());
            result.put("message", "Mã khuyến mãi hợp lệ");
        } catch (Exception e) {
            System.out.println("Promo code validation failed: " + e.getMessage());
            result.put("valid", false);
            result.put("code", code);
            result.put("discount", 0);
            result.put("message", e.getMessage());
        }
        
        return result;
    }

    @MutationMapping
    public double applyPromoCode(@Argument String code, @Argument double cartTotal) {
        try {
            System.out.println("Applying promo code: " + code + " for cart total: " + cartTotal);
            double discount = promoCodeService.applyPromoCode(code, cartTotal);
            System.out.println("Applied discount: " + discount);
            return discount;
        } catch (Exception e) {
            System.out.println("Failed to apply promo code: " + e.getMessage());
            return 0;
        }
    }
    
    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PromoCode createPromoCode(@Argument Map<String, Object> input) {
        // Convert the input map to a PromoCode object
        PromoCode promoCode = new PromoCode();
        
        promoCode.setCode((String) input.get("code"));
        promoCode.setDescription((String) input.get("description"));
        
        if (input.containsKey("discountAmount")) {
            promoCode.setDiscountAmount(((Number) input.get("discountAmount")).doubleValue());
        }
        
        if (input.containsKey("discountPercent")) {
            promoCode.setDiscountPercent(((Number) input.get("discountPercent")).doubleValue());
        }
        
        if (input.containsKey("minimumPurchase")) {
            promoCode.setMinimumPurchase(((Number) input.get("minimumPurchase")).doubleValue());
        }
        
        // Handle dates with proper exception handling
        try {
            if (input.containsKey("validFrom")) {
                promoCode.setValidFrom(new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                    .parse((String) input.get("validFrom")));
            }
            
            if (input.containsKey("validTo")) {
                promoCode.setValidTo(new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                    .parse((String) input.get("validTo")));
            }
        } catch (ParseException e) {
            throw new RuntimeException("Invalid date format: " + e.getMessage());
        }
        
        if (input.containsKey("usageLimit")) {
            promoCode.setUsageLimit(((Number) input.get("usageLimit")).intValue());
        }
        
        if (input.containsKey("isActive")) {
            promoCode.setActive((Boolean) input.get("isActive"));
        } else {
            promoCode.setActive(true);
        }
        
        return promoCodeService.createPromoCode(promoCode);
    }
    
    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PromoCode updatePromoCode(@Argument String id, @Argument Map<String, Object> input) {
        // Get existing promo code
        PromoCode promoCode = promoCodeService.getPromoCodeById(id);
        
        if (input.containsKey("code")) {
            promoCode.setCode((String) input.get("code"));
        }
        
        if (input.containsKey("description")) {
            promoCode.setDescription((String) input.get("description"));
        }
        
        if (input.containsKey("discountAmount")) {
            promoCode.setDiscountAmount(((Number) input.get("discountAmount")).doubleValue());
        }
        
        if (input.containsKey("discountPercent")) {
            promoCode.setDiscountPercent(((Number) input.get("discountPercent")).doubleValue());
        }
        
        if (input.containsKey("minimumPurchase")) {
            promoCode.setMinimumPurchase(((Number) input.get("minimumPurchase")).doubleValue());
        }
        
        // Handle dates
        try {
            if (input.containsKey("validFrom")) {
                promoCode.setValidFrom(new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                    .parse((String) input.get("validFrom")));
            }
            
            if (input.containsKey("validTo")) {
                promoCode.setValidTo(new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                    .parse((String) input.get("validTo")));
            }
        } catch (ParseException e) {
            throw new RuntimeException("Invalid date format: " + e.getMessage());
        }
        
        if (input.containsKey("usageLimit")) {
            promoCode.setUsageLimit(((Number) input.get("usageLimit")).intValue());
        }
        
        if (input.containsKey("isActive")) {
            promoCode.setActive((Boolean) input.get("isActive"));
        }
        
        return promoCodeService.updatePromoCode(id, promoCode);
    }
    
    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deletePromoCode(@Argument String id) {
        try {
            return promoCodeService.deletePromoCode(id);
        } catch (Exception e) {
            return false;
        }
    }
    
    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean createSamplePromoCodes() {
        try {
            promoCodeService.createSamplePromoCodes();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
