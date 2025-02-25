package com.example.trello.models;

import java.util.Date;

public interface Auditable {
    void setCreatedAt(Date createdAt);
    void setUpdatedAt(Date updatedAt);
    Date getCreatedAt();
    Date getUpdatedAt();
}
