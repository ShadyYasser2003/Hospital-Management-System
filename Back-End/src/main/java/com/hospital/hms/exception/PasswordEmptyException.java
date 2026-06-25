package com.hospital.hms.exception;

public class PasswordEmptyException extends RuntimeException{
    public PasswordEmptyException(String message) {
        super(message);
    }
}
