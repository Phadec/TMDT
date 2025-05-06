package com.example.user_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Data
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;
    
    @Column(name = "role_name", unique = true, nullable = false, length = 50)
    private String roleName;
    
    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissionsString;
    
    @Column(name = "permission_scope", nullable = false)
    @Enumerated(EnumType.STRING)
    private PermissionScope permissionScope = PermissionScope.CUSTOM;
    
    @Column(name = "description")
    private String description;
    
    @OneToMany(mappedBy = "role")
    private List<User> users = new ArrayList<>();
    
    @Transient
    private String[] permissions;
    
    public enum PermissionScope {
        CUSTOM, ALL
    }
    
    // Convert comma-separated string to array when getting permissions
    public String[] getPermissions() {
        if (permissionsString == null || permissionsString.isEmpty()) {
            return new String[0];
        }
        return permissionsString.split(",");
    }
    
    // Convert array to comma-separated string when setting permissions
    public void setPermissions(String[] permissions) {
        this.permissions = permissions;
        if (permissions != null && permissions.length > 0) {
            this.permissionsString = String.join(",", permissions);
        } else {
            this.permissionsString = "";
        }
    }
    
    // Add a new permission
    public void addPermission(String permission) {
        if (permission == null || permission.isEmpty()) {
            return;
        }
        
        String[] currentPermissions = getPermissions();
        if (Arrays.asList(currentPermissions).contains(permission)) {
            return;
        }
        
        String[] newPermissions = new String[currentPermissions.length + 1];
        System.arraycopy(currentPermissions, 0, newPermissions, 0, currentPermissions.length);
        newPermissions[currentPermissions.length] = permission;
        
        setPermissions(newPermissions);
    }
    
    // Remove a permission
    public void removePermission(String permission) {
        if (permission == null || permission.isEmpty()) {
            return;
        }
        
        List<String> permissionsList = new ArrayList<>(Arrays.asList(getPermissions()));
        if (permissionsList.remove(permission)) {
            setPermissions(permissionsList.toArray(new String[0]));
        }
    }
}
