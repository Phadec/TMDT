package com.example.choviet.config;
import com.example.choviet.entity.Role;
import com.example.choviet.service.RoleService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Data
@ConfigurationProperties(prefix = "authorization")
public class PermissionConfig {
    @Autowired
    private RoleService roleService;
    private String[] permissions;


    public boolean hasPermission(String roleName, String resource, String method) {
        Role role = roleService.getRole(roleName);
        permissions = role.getPermissions();

        String permission = "";
        for(String p : permissions) {
            if (p.contains(resource)){
                permission = p;
            }
        }

        String action = permission.substring(permission.indexOf(".")+1, permission.length());
        System.out.println("resource: " + resource);
        System.out.println("action: " + action);
        System.out.println("permission: " + Arrays.toString(permissions));

        if(action.contains("*")) return true;


        return mapToMethod(action).equals(method);
    }

    private String mapToMethod(String action){
        action = action.toLowerCase();

        if(action.contains("view")){
            return "get";
        }else if(action.contains("delete")){
            return "delete";
        }else if(action.contains("update")){
            return "put";
        }else if(action.contains("create")){
            return "post";
        }
        return "";
    }

}