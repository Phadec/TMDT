package com.example.choviet.service;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import static com.example.choviet.config.Constants.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class PagingService {
    public Pageable createPageable(int page, int size) {
        page = Math.max(0, page);
        size = (size <= 0) ? SIZE_15 : Math.min(size, SIZE_15);
        return PageRequest.of(page, size);
    }

    public Pageable createPageableWithSort(int page, int size, Sort sort) {
        page = Math.max(0, page);
        size = (size <= 0) ? SIZE_15 : Math.min(size, SIZE_15);
        return PageRequest.of(page, size, sort);
    }
}
