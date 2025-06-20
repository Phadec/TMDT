package com.example.choviet.controller.admin;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import static com.example.choviet.config.api.Mid.*;
import static com.example.choviet.config.api.Prefix.*;
import static com.example.choviet.config.api.suffix.User.*;

import org.springframework.web.bind.annotation.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + USER)
public class UserAdminController {

}