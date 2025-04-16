package com.example.demo.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "reports")
public class Report {
    @Id
    private String id;
    private String reportType; // USER or PRODUCT
    private String reportedItemId; // User ID or Product ID
    private String reportedBy; // Username of reporter
    private String reason; // Reason code - SPAM, OFFENSIVE, FAKE, ILLEGAL, etc.
    private String details; // Additional details provided by reporter
    private String status; // PENDING, REVIEWED, RESOLVED, REJECTED
    private Date createdAt;
    private Date updatedAt;
    private String reviewedBy; // Admin who reviewed the report
    private String resolution; // Resolution details if any
    
    public Report() {
        this.createdAt = new Date();
        this.status = "PENDING";
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getReportedItemId() {
        return reportedItemId;
    }

    public void setReportedItemId(String reportedItemId) {
        this.reportedItemId = reportedItemId;
    }

    public String getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(String reportedBy) {
        this.reportedBy = reportedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }
}
