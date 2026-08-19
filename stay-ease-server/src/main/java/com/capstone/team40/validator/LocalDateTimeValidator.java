package com.capstone.team40.validator;

import com.capstone.team40.annotation.ValidLocalDateTime;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class LocalDateTimeValidator implements ConstraintValidator<ValidLocalDateTime, LocalDateTime>
{
    private DateTimeFormatter formatter;

    @Override
    public void initialize(ValidLocalDateTime constraintAnnotation)
    {
        this.formatter = DateTimeFormatter.ofPattern(constraintAnnotation.pattern());
    }

    @Override
    public boolean isValid(LocalDateTime value, ConstraintValidatorContext context)
    {
        try
        {
            // Re-formatting ensures bounds and format are correct
            value.format(formatter);
            return true;
        }
        catch (DateTimeParseException e)
        {
            return false;
        }
    }
}
