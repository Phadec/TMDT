package com.example.choviet.service;

import com.example.choviet.entity.Role;
import com.example.choviet.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class RoleService {
    @Autowired
    RoleRepository roleRepository;

    public List<Role> getRoles(){
        return roleRepository.findAll();
    }
    public Role getRole(String roleName){
        Role.RoleName roleEnum = Role.RoleName.valueOf(roleName);
        Optional<Role> optionalRole = roleRepository.findByRoleName(roleEnum);

        return optionalRole.orElseThrow(() ->
                new RuntimeException("Role not found: " + roleName)
        );
    }

}
