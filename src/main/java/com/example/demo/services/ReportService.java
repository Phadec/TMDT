package com.example.demo.services;

import com.example.demo.models.Report;
import com.example.demo.models.Product;
import com.example.demo.repositories.ReportRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.dtos.ReportInput;
import com.example.demo.exceptions.BadRequestException;
import com.example.demo.exceptions.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class ReportService {

    private static final int MAX_REPORTS_THRESHOLD = 5; // Threshold to trigger automatic action
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * Create a new report
     */
    @Transactional
    public Report createReport(ReportInput reportInput, String reportedBy) {
        // Validate report type
        if (!reportInput.getReportType().equals("USER") && !reportInput.getReportType().equals("PRODUCT")) {
            throw new BadRequestException("Invalid report type. Must be USER or PRODUCT.");
        }
        
        // Validate that the reported item exists
        if (reportInput.getReportType().equals("USER")) {
            userRepository.findById(reportInput.getReportedItemId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else {
            productRepository.findById(reportInput.getReportedItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        }
        
        // Prevent user from reporting themselves
        if (reportInput.getReportType().equals("USER") && 
            reportInput.getReportedItemId().equals(reportedBy)) {
            throw new BadRequestException("You cannot report yourself.");
        }
        
        // Check if user has already reported this item
        List<Report> existingReports = reportRepository.findByReportTypeAndReportedItemId(
            reportInput.getReportType(), reportInput.getReportedItemId());
        
        boolean alreadyReported = existingReports.stream()
            .anyMatch(report -> report.getReportedBy().equals(reportedBy));
            
        if (alreadyReported) {
            throw new BadRequestException("You have already reported this " + 
                (reportInput.getReportType().equals("USER") ? "user" : "product"));
        }
        
        // Create new report
        Report report = new Report();
        report.setReportType(reportInput.getReportType());
        report.setReportedItemId(reportInput.getReportedItemId());
        report.setReason(reportInput.getReason());
        report.setDetails(reportInput.getDetails());
        report.setReportedBy(reportedBy);
        report.setStatus("PENDING");
        report.setCreatedAt(new Date());
        
        // Save report
        Report savedReport = reportRepository.save(report);
        
        // Check if threshold has been reached
        long reportCount = reportRepository.countByReportTypeAndReportedItemId(
            reportInput.getReportType(), reportInput.getReportedItemId());
            
        System.out.println("Report count for " + reportInput.getReportType() + " " + 
            reportInput.getReportedItemId() + ": " + reportCount);
            
        // If threshold reached, take automatic action
        if (reportCount >= MAX_REPORTS_THRESHOLD) {
            if (reportInput.getReportType().equals("USER")) {
                disableReportedUser(reportInput.getReportedItemId());
            } else {
                disableReportedProducts(reportInput.getReportedItemId());
            }
        }
        
        return savedReport;
    }
    
    /**
     * Get reports by type and item ID
     */
    public List<Report> getReportsByItem(String type, String itemId) {
        return reportRepository.findByReportTypeAndReportedItemId(type, itemId);
    }
    
    /**
     * Get all pending reports
     */
    public List<Report> getPendingReports() {
        return reportRepository.findByStatus("PENDING");
    }
    
    /**
     * Review a report and update its status
     */
    @Transactional
    public Report reviewReport(String reportId, String status, String resolution, String reviewedBy) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
            
        report.setStatus(status);
        report.setResolution(resolution);
        report.setReviewedBy(reviewedBy);
        report.setUpdatedAt(new Date());
        
        // Take action based on review
        if (status.equals("RESOLVED")) {
            if (report.getReportType().equals("USER")) {
                disableReportedUser(report.getReportedItemId());
            } else {
                disableReportedProducts(report.getReportedItemId());
            }
        }
        
        return reportRepository.save(report);
    }
    
    /**
     * Disable a reported user
     */
    private void disableReportedUser(String userId) {
        try {
            System.out.println("Automatically disabling reported user: " + userId);
            
            // Disable user account
            userService.disableUser(userId);
            
            // Disable all their products
            List<Product> userProducts = productRepository.findBySellerUsername(userId);
            for (Product product : userProducts) {
                product.setStatus("DELETED");
                product.setUpdatedAt(new Date());
                productRepository.save(product);
            }
            
            System.out.println("Successfully disabled user and " + userProducts.size() + " products");
        } catch (Exception e) {
            System.err.println("Error disabling reported user: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Disable a reported product
     */
    private void disableReportedProducts(String productId) {
        try {
            System.out.println("Automatically disabling reported product: " + productId);
            
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                
            product.setStatus("DELETED");
            product.setUpdatedAt(new Date());
            productRepository.save(product);
            
            System.out.println("Successfully disabled product");
        } catch (Exception e) {
            System.err.println("Error disabling reported product: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Get reports submitted by a user
     */
    public List<Report> getReportsByUser(String username) {
        return reportRepository.findByReportedBy(username);
    }
    
    /**
     * Count pending reports for a specific item
     */
    public long countPendingReportsByItem(String type, String itemId) {
        return reportRepository.countByReportTypeAndReportedItemIdAndStatus(type, itemId, "PENDING");
    }
}
