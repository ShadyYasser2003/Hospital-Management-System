package com.hospital.hms.exception;

public class TransferAlreadySentException extends RuntimeException {
    public TransferAlreadySentException(String message) {
        super(message);
    }
}
