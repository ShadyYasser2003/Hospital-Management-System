package com.hospital.hms.exception;

public class MedicineCategoryNotFound extends RuntimeException {
    public MedicineCategoryNotFound(String message) {
        super(message);
    }
}
