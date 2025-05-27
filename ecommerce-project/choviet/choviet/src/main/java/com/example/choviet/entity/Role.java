package com.example.choviet.entity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Document(collection = "roles")
@Data
public class Role {
    @Id
    private int id;

    private String roleName;

    private String permissionsString;

    private PermissionScope permissionScope;

    private String description;

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