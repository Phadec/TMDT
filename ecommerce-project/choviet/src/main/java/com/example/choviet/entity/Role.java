package com.example.choviet.entity;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Document(collection = "roles")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Role {
    @Id
    String id;

    RoleName roleName;

    PermissionScope permissionScope;

    String description;

    String[] permissions;

    public enum PermissionScope {
        CUSTOM, ALL
    }

    public enum RoleName{
        SUPER_ADMIN, ADMIN, STAFF, STAFF_MANAGEMENT, STAFF_CHAT, STAFF_NEWS
    }
}