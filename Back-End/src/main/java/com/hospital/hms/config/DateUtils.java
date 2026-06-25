package com.hospital.hms.config;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class DateUtils {

    private static final DateTimeFormatter[] FORMATS = {
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("dd-MM-yyyy"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd"),
    };

    public static LocalDate parse(String value) {
        if (value == null || value.isBlank()) return null;
        for (DateTimeFormatter fmt : FORMATS) {
            try {
                return LocalDate.parse(value.trim(), fmt);
            } catch (DateTimeParseException ignored) {}
        }
        throw new RuntimeException("Cannot parse date: '" + value + "'. Use yyyy-MM-dd or dd-MM-yyyy");
    }

    public static String format(LocalDate date) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
}
