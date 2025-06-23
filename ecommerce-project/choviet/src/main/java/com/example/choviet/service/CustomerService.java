package com.example.choviet.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.choviet.config.ErrorConfig;
import com.example.choviet.dto.PersonRequest;
import com.example.choviet.dto.ProfileResponse;
import com.example.choviet.entity.Customer;
import com.example.choviet.exception.AppException;
import com.example.choviet.repository.CustomerRepository;
import com.example.choviet.utils.JwtUtil;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class CustomerService {
    @Autowired
    CustomerRepository customerRepository;
    final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Lấy thông tin chi tiết của customer theo ID
     * @param customerId ID của customer
     * @return ProfileResponse chứa thông tin chi tiết của customer
     */
    public ProfileResponse getCustomerById(String customerId) {
        Optional<Customer> customerOptional = customerRepository.findById(customerId);
        if (customerOptional.isEmpty()) {
            throw new AppException(ErrorConfig.NOT_FOUND, "Không tìm thấy thông tin khách hàng");
        }
        Customer customer = customerOptional.get();
        
        return ProfileResponse.builder()
                .id(customer.getId())
                .email(customer.getEmail())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .status(customer.getStatus())
                .addresses(customer.getAddresses())
                .isSeller(customer.isSeller())
                .createdAt(customer.getCreatedAt())
                .updateAt(customer.getUpdateAt())
                .build();
    }
    
    /**
     * Đăng ký trở thành người bán
     * @param customerId ID của customer
     * @return ProfileResponse chứa thông tin đã cập nhật
     */
    public ProfileResponse registerAsSeller(String customerId) {
        Optional<Customer> customerOptional = customerRepository.findById(customerId);
        if (customerOptional.isEmpty()) {
            throw new AppException(ErrorConfig.NOT_FOUND, "Không tìm thấy thông tin khách hàng");
        }
        
        Customer customer = customerOptional.get();
        
        // Kiểm tra xem khách hàng đã là seller chưa
        if (customer.isSeller()) {
            throw new AppException(ErrorConfig.BAD_REQUEST, "Khách hàng đã là người bán");
        }
        
        // Cập nhật trạng thái seller
        customer.setSeller(true);
        customer.setUpdateAt(LocalDateTime.now());
        
        // Lưu vào database
        Customer updatedCustomer = customerRepository.save(customer);
        
        return ProfileResponse.builder()
                .id(updatedCustomer.getId())
                .email(updatedCustomer.getEmail())
                .fullName(updatedCustomer.getFullName())
                .phone(updatedCustomer.getPhone())
                .status(updatedCustomer.getStatus())
                .addresses(updatedCustomer.getAddresses())
                .isSeller(updatedCustomer.isSeller())
                .createdAt(updatedCustomer.getCreatedAt())
                .updateAt(updatedCustomer.getUpdateAt())
                .build();
    }

    public void updateProfile(PersonRequest personRequest){
        String id = personRequest.getPersonId();

        Optional<Customer> customer = Optional.ofNullable(customerRepository.findById(id).orElseThrow(null));

        if(customer.isPresent()){
            Customer customerPresent = customer.get();
            String name = personRequest.getName().isEmpty() ? customerPresent.getFullName() : personRequest.getName();
            String email = personRequest.getEmail().isEmpty() ? customerPresent.getEmail() : personRequest.getEmail();
            String phone = personRequest.getPhone().isEmpty() ? customerPresent.getPhone() : personRequest.getPhone();
            String password = personRequest.getPassword().isEmpty() ? customerPresent.getPasswordHash() : personRequest.getPassword();
            List<String> address = personRequest.getAddresses().isEmpty() ? customerPresent.getAddresses() : personRequest.getAddresses();

            customerPresent.setFullName(name);
            customerPresent.setEmail(email);
            customerPresent.setPhone(phone);
            customerPresent.setAddresses(address);
            customerPresent.setPasswordHash(passwordEncoder.encode(password));

            System.out.println(customerPresent);
            customerRepository.save(customerPresent);
        }
    }

    /**
     * Lấy tất cả khách hàng với phân trang (cho admin)
     * @param page số trang
     * @param size kích thước trang
     * @return Page<Customer>
     */
    public Page<Customer> getAllCustomersPaging(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return customerRepository.findAll(pageable);
    }

    /**
     * Lấy thông tin Customer entity theo ID (cho admin)
     * @param customerId ID của customer
     * @return Customer entity
     */
    public Customer getCustomerEntityById(String customerId) {
        Optional<Customer> customerOptional = customerRepository.findById(customerId);
        if (customerOptional.isEmpty()) {
            throw new AppException(ErrorConfig.NOT_FOUND, "Không tìm thấy thông tin khách hàng");
        }
        return customerOptional.get();
    }

    /**
     * Cập nhật trạng thái khách hàng (cho admin)
     * @param customerId ID của customer
     * @param status trạng thái mới
     * @return Customer đã cập nhật
     */
    public Customer updateCustomerStatus(String customerId, String status) {
        Customer customer = getCustomerEntityById(customerId);
        
        try {
            Customer.Status newStatus = Customer.Status.valueOf(status.toUpperCase());
            customer.setStatus(newStatus);
            customer.setUpdateAt(LocalDateTime.now());
            return customerRepository.save(customer);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorConfig.BAD_REQUEST, "Trạng thái không hợp lệ: " + status);
        }
    }

    /**
     * Xóa khách hàng (cho admin)
     * @param customerId ID của customer
     */
    public void deleteCustomer(String customerId) {
        Customer customer = getCustomerEntityById(customerId);
        customerRepository.delete(customer);
    }

    /**
     * Đăng ký khách hàng thành người bán và trả về entity (cho admin)
     * @param customerId ID của customer
     * @return Customer entity đã cập nhật
     */
    public Customer registerAsSellerEntity(String customerId) {
        Customer customer = getCustomerEntityById(customerId);
        
        // Kiểm tra xem khách hàng đã là seller chưa
        if (customer.isSeller()) {
            throw new AppException(ErrorConfig.BAD_REQUEST, "Khách hàng đã là người bán");
        }
        
        // Cập nhật trạng thái seller
        customer.setSeller(true);
        customer.setUpdateAt(LocalDateTime.now());
        
        return customerRepository.save(customer);
    }
}