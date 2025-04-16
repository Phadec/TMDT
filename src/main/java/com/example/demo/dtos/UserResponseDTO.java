package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.SimpleDateFormat;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String avatar;
    private String role;
    private boolean enabled;
    private boolean emailVerified;
    private String createdAt;
    private String updatedAt;

    /**
     * Set the created date using a Date object
     * @param date The date to set
     */
    public void setCreatedAtDate(Date date) {
        if (date != null) {
            this.createdAt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(date);
        }
    }
    
    /**
     * Set the updated date using a Date object
     * @param date The date to set
     */
    public void setUpdatedAtDate(Date date) {
        if (date != null) {
            this.updatedAt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(date);
        }
    }
}
