package com.hospital.hms.exception;

public class EmailAlreadyExistException extends RuntimeException{
    public EmailAlreadyExistException(String message) {
        super(message);
    }
}
