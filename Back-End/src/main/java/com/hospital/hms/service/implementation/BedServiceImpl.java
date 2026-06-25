package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.BedStatus;
import com.hospital.hms.dto.BedDTO;
import com.hospital.hms.entity.Bed;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.exception.BedNotFoundException;
import com.hospital.hms.exception.BedNumberAlreadyExist;
import com.hospital.hms.exception.PatientNotFoundException;
import com.hospital.hms.mapper.BedMapper;
import com.hospital.hms.repository.BedRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BedServiceImpl implements BedService {

    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;

    @Override
    public List<BedDTO> getAllBeds() {
        return bedRepository.findAll()
                .stream()
                .map(BedMapper::mapToBedaDTO)
                .toList();
    }

    @Override
    public BedDTO getBedById(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        return BedMapper.mapToBedaDTO(bed);
    }

    @Override
    public BedDTO getBedByNumber(String bedNumber) {
        Bed bed = bedRepository.findByBedNumber(bedNumber)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        return BedMapper.mapToBedaDTO(bed);
    }

    @Override
    public BedDTO createBed(BedDTO bedDTO) {
        if (bedRepository.findByBedNumber(bedDTO.getBedNumber()).isPresent()) {
            throw new BedNumberAlreadyExist("Bed number already exists");
        }
        Bed bed = new Bed();
        bed.setBedNumber(bedDTO.getBedNumber());
        bed.setWardName(bedDTO.getWardName());
        bed.setStatus(BedStatus.AVAILABLE);

        Bed savedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(savedBed);
    }

    @Override
    public BedDTO updateBed(Long id, BedDTO bedDTO) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        bed.setWardName(bedDTO.getWardName());

        Bed updatedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(updatedBed);
    }

    @Override
    public BedDTO assignPatientToBed(Long bedId, Long patientId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new RuntimeException("Bed is already occupied");
        }
        bed.setPatient(patient);
        bed.setPatientName(patient.getName());
        bed.setStatus(BedStatus.OCCUPIED);

        Bed updatedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(updatedBed);
    }

    @Override
    public BedDTO releasePatientFromBed(Long bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        bed.setPatient(null);
        bed.setPatientName(null);
        bed.setStatus(BedStatus.AVAILABLE);

        Bed updatedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(updatedBed);
    }

    @Override
    public void deleteBed(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        bedRepository.delete(bed);
    }

    @Override
    public List<BedDTO> getBedsByStatus(String status) {
        BedStatus bedStatus = BedStatus.valueOf(status.toUpperCase());
        return bedRepository.findByStatus(bedStatus)
                .stream()
                .map(BedMapper::mapToBedaDTO)
                .toList();
    }

    @Override
    public List<BedDTO> getBedsByWard(String wardName) {
        return bedRepository.findByWardName(wardName)
                .stream()
                .map(BedMapper::mapToBedaDTO)
                .toList();
    }

    @Override
    public BedDTO setMaintenanceMode(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new RuntimeException("Cannot set maintenance mode for occupied bed");
        }

        bed.setStatus(BedStatus.MAINTENANCE);
        Bed updatedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(updatedBed);
    }
}
