package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@Document(collection = "orders")
public class Order {
    @Id
    String id;
    Customer customer;
    String fullName;
    String phone;
    Discount discount;

    Map<String, String> product; // productVariant, quantity, price
    Map<String, String> fee; // service_id, insurance_value, from_district_id, from_ward_code, service_type_id, to_district_id, to_ward_code, height, length, weight, width, coupon
    Map<String, String> address; // to_address, from_address (gồm province, district, ward)
    Map<String, String> payment; // transaction, method, status, createdAt
    // nếu transaction là COD thì method trống, transaction là online thì method là đơn vị cung cấp
    Status status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    public enum Status {
        READY_TO_PICK,
        PICKING,
        PICKED,
        STORING,
        TRANSPORTING,
        DELIVERING,
        DELIVERED,
        DELIVERY_FAIL,
        WAITING_TO_RETURN,
        RETURN,
        RETURN_TRANSPORTING,
        RETURNING,
        RETURNED,
        RETURN_FAIL,
        CANCEL
    }
    /*
        Khởi tạo đơn hàng (Pending)
        Đã thanh toán (Payment Confirmed)
        Đang xử lý (Preparing Order)
        Đã đóng gói (Packed)
        Đang giao hàng (Shipping)
        Giao hàng thành công (Delivered)
        Đánh giá / Hậu mãi (Completed)

        Đơn hủy (Cancelled): Người dùng hoặc hệ thống huỷ đơn vì lý do nào đó.
        Thất bại (Delivery Failed): Giao hàng không thành công (vắng mặt, sai địa chỉ, từ chối nhận…).
        Hoàn hàng (Returned): Người dùng trả hàng.
        Hoàn tiền (Refunded): Tiền được hoàn lại cho người mua.
     */
}