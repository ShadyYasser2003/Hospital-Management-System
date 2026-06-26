package com.hospital.hms.service;

import com.hospital.hms.dto.BloodRequestDto;
import com.hospital.hms.dto.BloodUnitDto;

import java.util.List;

public interface BloodBankService {

    // ── Blood Unit management ──────────────────────────────────────────────

    List<BloodUnitDto> getAllBloodUnits();

    BloodUnitDto addBloodUnit(BloodUnitDto dto);

    BloodUnitDto updateBloodUnit(Long id, BloodUnitDto dto);

    // ── Blood Request queries ──────────────────────────────────────────────

    List<BloodRequestDto> getAllRequests();

    List<BloodRequestDto> getRequestsByPatient(Long patientId);

    List<BloodRequestDto> getPendingRequests();

    // ── Blood Request lifecycle ────────────────────────────────────────────

    /**
     * Create a blood request. If sufficient AVAILABLE, non-expired units exist
     * they are auto-reserved and the request status is set to RESERVED.
     * Otherwise the request is left PENDING and a notification email is sent.
     */
    BloodRequestDto requestBlood(BloodRequestDto dto);

    /**
     * Finalize a RESERVED request: mark the allocated units USED and the
     * request COMPLETED. Only valid when status == RESERVED.
     */
    BloodRequestDto fulfillRequest(Long requestId);

    /**
     * Cancel a PENDING or RESERVED request. If RESERVED, the allocated units
     * are released back to AVAILABLE so they can be claimed by other requests.
     */
    BloodRequestDto cancelRequest(Long requestId);
}
