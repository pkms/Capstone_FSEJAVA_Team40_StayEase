package com.capstone.team40.annotation;

import com.capstone.team40.validator.LocalDateTimeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LocalDateTimeValidator.class)
public @interface ValidLocalDateTime
{
    String message() default "Invalid date-time format. Expected yyyy-MM-dd'T'HH:mm:ss";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String pattern() default "yyyy-MM-dd'T'HH:mm:ss";
}
