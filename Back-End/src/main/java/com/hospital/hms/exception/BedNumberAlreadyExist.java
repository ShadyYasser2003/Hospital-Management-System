package com.hospital.hms.exception;

public class BedNumberAlreadyExist extends RuntimeException{
    public BedNumberAlreadyExist(String message) {
        super(message);
    }
}
