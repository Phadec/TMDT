package com.example.trello.listeners;

import java.util.Date;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;
import com.example.trello.models.Auditable;

@Component
public class AuditListener extends AbstractMongoEventListener<Object> {
    
    @SuppressWarnings("null")
    @Override
    public void onBeforeConvert(BeforeConvertEvent<Object> event) {
        Object source = event.getSource();
        if (source instanceof Auditable) {
            Auditable auditable = (Auditable) source;
            Date now = new Date();
            
            if (auditable.getCreatedAt() == null) {
                auditable.setCreatedAt(now);
            }
            auditable.setUpdatedAt(now);
        }
    }
}
