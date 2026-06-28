package com.hospital.hms.service;

import com.hospital.hms.dto.BloodDonationDto;

import java.util.List;

public interface BloodDonationService {
    BloodDonationDto recordDonation(BloodDonationDto dto);
    List<BloodDonationDto> getAll();
    List<BloodDonationDto> getByPatient(Long patientId);
}
