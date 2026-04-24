package com.hospital.hms.service;


import com.hospital.hms.dto.MedicineStockDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MedicineStockService {
    List<MedicineStockDto> getAllMedicineStocks();
    MedicineStockDto getMedicineStockById(Long id);
    MedicineStockDto createMedicineStock(MedicineStockDto medicineStockDto);
    MedicineStockDto updateMedicineStock(Long id, String operation, int quantity);
    void deleteMedicineStock(Long id);
    List<MedicineStockDto> getLowStockMedicines();
    List<MedicineStockDto> getExpiringMedicineStock(int days); //get expiring soon medicine (after x days) not ALREADY expired
    List<MedicineStockDto> getALlStocksOfMedicine(Long medicineId);
}
