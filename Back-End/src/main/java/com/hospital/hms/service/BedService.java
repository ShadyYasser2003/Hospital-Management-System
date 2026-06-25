package com.hospital.hms.service;

import com.hospital.hms.dto.BedDTO;

import java.util.List;

public interface BedService {
    public List<BedDTO> getAllBeds();
    public BedDTO getBedById(Long id);
    public BedDTO getBedByNumber(String bedNumber);
    public BedDTO createBed(BedDTO bedDTO);
    public BedDTO updateBed(Long id, BedDTO bedDTO);
    public BedDTO assignPatientToBed(Long bedId, Long patientId);
    public BedDTO releasePatientFromBed(Long bedId);
    public void deleteBed(Long id);
    public List<BedDTO> getBedsByStatus(String status);
    public List<BedDTO> getBedsByWard(String wardName);
    public BedDTO setMaintenanceMode(Long id);
}
