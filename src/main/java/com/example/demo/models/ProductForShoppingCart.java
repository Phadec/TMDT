package com.example.demo.models;

public class ProductForShoppingCart {
    String id;
    String title;
    String description;
    String mainImage;
    String condition; // NEW, USED

    /**
     * !!! Không có giá vì giá và status thay đổi thường xuyên, nên phải cập nhật lại liên tục
     * Dùng cho việc tối ưu tốc độ và truy xuất.
     * + Lưu id: Phải truy xuất sau gọi
     * + Lưu toàn bộ: Thừa thải, phí bộ nhớ
     * => Cách lựa chọn, lưu thông tin muốn hiển thị và cần thiết
     */
}
