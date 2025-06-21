package com.example.choviet.service;

import java.time.LocalDateTime;
import java.util.Optional;

import com.example.choviet.dto.PersonRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.choviet.config.ErrorConfig;
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

    @Autowired
    JwtUtil jwtUtil;
    @Autowired
    RedisService redisService;

    @Autowired
    RabbitMQService eventPublisher;
    @Autowired
    PagingService pagingService;

    
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
            String address = personRequest.getAddress().isEmpty() ? customerPresent.getAddresses() : personRequest.getAddress();

            customerPresent.setFullName(name);
            customerPresent.setEmail(email);
            customerPresent.setPhone(phone);
            customerPresent.setAddresses(address);
            System.out.println(customerPresent);
            customerRepository.save(customerPresent);
        }
    }
}
