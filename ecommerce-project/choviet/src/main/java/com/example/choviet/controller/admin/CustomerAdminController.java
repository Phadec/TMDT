package com.example.choviet.controller.admin;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.dto.AuthResponse;
import com.example.choviet.service.CustomerService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.Code.OK;
import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.Customer.*;

@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + CUSTOMER)
public class CustomerAdminController {
    @Autowired
    CustomerService customerService;
}
