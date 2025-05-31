package com.example.choviet.service;

import com.example.choviet.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class RoleService {
    @Autowired
    RoleRepository roleRepository;

}
