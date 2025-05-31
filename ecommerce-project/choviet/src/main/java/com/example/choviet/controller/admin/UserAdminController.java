package com.example.choviet.controller.admin;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import static com.example.choviet.config.API.Prefix.*;
import static com.example.choviet.config.API.Mid.*;
import static com.example.choviet.config.API.suffix.User.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(ADMIN + USER)
public class UserAdminController {


}