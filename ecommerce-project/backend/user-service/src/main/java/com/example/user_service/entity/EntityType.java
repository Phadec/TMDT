package com.example.user_service.entity;


import com.example.notification_service.entity.Notification;
import com.example.order_service.entity.DiscountEntity;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "entity_types")
public class EntityType {
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private int id;

    @Column(name = "name", unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "entityType", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Notification> notifications;

    @OneToMany(mappedBy = "entityType", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DiscountEntity> discountEntities;

}
