package com.example.choviet.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    /**
     * Resource name (e.g., "user", "customer", "order")
     */
    String resource();

    /**
     * Required action (e.g., "CREATE", "READ", "UPDATE", "DELETE")
     */
    String action();

    /**
     * Whether to allow access for users with higher authority
     * Default is true
     */
    boolean allowHigherAuthority() default true;
}