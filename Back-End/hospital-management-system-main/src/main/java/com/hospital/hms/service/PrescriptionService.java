package com.hospital.hms.service;

import com.hospital.hms.dto.PrescriptionDTO;

import java.util.List;

public interface PrescriptionService {
    public List<PrescriptionDTO> getAllPrescriptions() ;
    public PrescriptionDTO getPrescriptionById(Long id);
    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId);
    public PrescriptionDTO createPrescription(PrescriptionDTO prescriptionDTO);
    public PrescriptionDTO updatePrescription(Long id, PrescriptionDTO prescriptionDTO);
    public void deletePrescription(Long id);
    public List<PrescriptionDTO> getPrescriptionsByStatus(String status);
    public PrescriptionDTO markAsDispensed(Long id);
    public PrescriptionDTO markAsPartiallyDispensed(Long id);
    public PrescriptionDTO cancelPrescription(Long id);

}