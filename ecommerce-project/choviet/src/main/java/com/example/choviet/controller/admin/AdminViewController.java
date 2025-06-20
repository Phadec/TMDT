package com.example.choviet.controller.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminViewController {

    /**
     * Trang quản lý Redis
     */
    @GetMapping("/redis-manager")
    public String redisManager() {
        return "redirect:/admin/redis-manager.html";
    }
}
