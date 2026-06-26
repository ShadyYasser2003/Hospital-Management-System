package com.hospital.hms.exception;

public class LicenseNumberAlreadyExistsException extends RuntimeException {
    public LicenseNumberAlreadyExistsException(String message) {
        super(message);
    }
}
