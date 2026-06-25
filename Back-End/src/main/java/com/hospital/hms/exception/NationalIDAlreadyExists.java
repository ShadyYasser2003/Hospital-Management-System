package com.hospital.hms.exception;

public class NationalIDAlreadyExists extends RuntimeException{
    public NationalIDAlreadyExists(String message) {
        super(message);
    }
}
