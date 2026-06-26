package com.hospital.hms.service;

import com.hospital.hms.entity.LabTest;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.RadiologyOrder;
import com.hospital.hms.entity.TransferRequest;

import java.util.List;

public interface PdfGeneratorService {

    byte[] generateTransferPdf(TransferRequest transfer,
                               Patient patient,
                               List<LabTest> labTests,
                               List<RadiologyOrder> radiologyOrders);
}