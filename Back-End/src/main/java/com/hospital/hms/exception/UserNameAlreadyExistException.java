package com.hospital.hms.exception;

public class UserNameAlreadyExistException extends RuntimeException {
    public UserNameAlreadyExistException(String message) {
        super(message);
    }
}
