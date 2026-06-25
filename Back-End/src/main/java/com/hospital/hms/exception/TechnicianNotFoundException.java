package com.hospital.hms.exception;

public class TechnicianNotFoundException extends RuntimeException {
    public TechnicianNotFoundException(String message) {
        super(message);
    }
}
