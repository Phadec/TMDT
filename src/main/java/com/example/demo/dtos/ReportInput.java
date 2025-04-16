package com.example.demo.dtos;

public class ReportInput {
    private String reportType; // USER or PRODUCT
    private String reportedItemId; // User ID or Product ID
    private String reason;
    private String details;

    // Getters and Setters
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
}
