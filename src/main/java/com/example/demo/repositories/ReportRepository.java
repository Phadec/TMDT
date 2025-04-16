package com.example.demo.repositories;

import com.example.demo.models.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByReportTypeAndReportedItemId(String reportType, String reportedItemId);
    long countByReportTypeAndReportedItemId(String reportType, String reportedItemId);
    long countByReportTypeAndReportedItemIdAndStatus(String reportType, String reportedItemId, String status);
    List<Report> findByReportedBy(String username);
    List<Report> findByStatus(String status);
    
    @Query("{'reportType': 'PRODUCT', 'reportedItemId': {$in: ?0}}")
    List<Report> findProductReportsByProductIds(List<String> productIds);
}
