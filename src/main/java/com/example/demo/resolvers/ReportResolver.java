package com.example.demo.resolvers;

import com.example.demo.models.Report;
import com.example.demo.models.User;
import com.example.demo.security.SecurityUtils;
import com.example.demo.models.Product;
import com.example.demo.dtos.ReportInput;
import com.example.demo.services.ReportService;
import com.example.demo.services.UserService;
import com.example.demo.services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class ReportResolver {

    @Autowired
    private ReportService reportService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ProductService productService;
    
    // Queries
    
    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Report> pendingReports() {
        return reportService.getPendingReports();
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Report> userReports() {
        String username = SecurityUtils.getCurrentUsername();
        return reportService.getReportsByUser(username);
    }
    
    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Report> itemReports(@Argument String type, @Argument String itemId) {
        return reportService.getReportsByItem(type, itemId);
    }
    
    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public long pendingReportCount(@Argument String type, @Argument String itemId) {
        return reportService.countPendingReportsByItem(type, itemId);
    }
    
    // Mutations
    
    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Report createReport(@Argument ReportInput input) {
        String username = SecurityUtils.getCurrentUsername();
        return reportService.createReport(input, username);
    }
    
    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Report reviewReport(
        @Argument String id, 
        @Argument String status, 
        @Argument String resolution
    ) {
        String adminUsername = SecurityUtils.getCurrentUsername();
        return reportService.reviewReport(id, status, resolution, adminUsername);
    }
    
    // Field resolvers
    
    @SchemaMapping
    public User reportedUser(Report report) {
        if ("USER".equals(report.getReportType())) {
            try {
                return userService.findByUsername(report.getReportedItemId());
            } catch (Exception e) {
                return null; // User might have been deleted
            }
        }
        return null;
    }
    
    @SchemaMapping
    public Product reportedProduct(Report report) {
        if ("PRODUCT".equals(report.getReportType())) {
            try {
                return productService.getProductById(report.getReportedItemId());
            } catch (Exception e) {
                return null; // Product might have been deleted
            }
        }
        return null;
    }
    
    @SchemaMapping
    public User reporter(Report report) {
        try {
            return userService.findByUsername(report.getReportedBy());
        } catch (Exception e) {
            return null; // User might have been deleted
        }
    }
    
    @SchemaMapping
    public User reviewer(Report report) {
        if (report.getReviewedBy() != null) {
            try {
                return userService.findByUsername(report.getReviewedBy());
            } catch (Exception e) {
                return null; // User might have been deleted
            }
        }
        return null;
    }
}
