package com.hospital.hms.mapper;

import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.MedicineStockDto;
import com.hospital.hms.entity.MedicineStock;

public class MedicineStockMapper {

    public static MedicineStockDto mapToDto(MedicineStock medicineStock) {
        return MedicineStockDto.builder()
                .id(medicineStock.getId())
                .manufacturer(medicineStock.getManufacturer())
                .medicineForm(medicineStock.getMedicineForm())
                .reOrderLevel(medicineStock.getReOrderLevel())
                .dosage(medicineStock.getDosage())
                .sellingPrice(medicineStock.getSellingPrice())
                .unitPurchase(medicineStock.getUnitPurchase())
                .expiryDate(DateUtils.format(medicineStock.getExpiryDate()))
                .storageLocation(medicineStock.getStorageLocation())
                .purchaseQuantity(medicineStock.getPurchaseQuantity())
                .packageSize(medicineStock.getPackageSize())
                .medicineId(medicineStock.getMedicine() != null ? medicineStock.getMedicine().getId() : null)
                .currentQuantity(medicineStock.getCurrentQuantity())
                .build();
    }

    public static MedicineStock mapFromDto(MedicineStockDto medicineStock) {
        return MedicineStock.builder()
                .id(medicineStock.getId())
                .manufacturer(medicineStock.getManufacturer())
                .medicineForm(medicineStock.getMedicineForm())
                .reOrderLevel(medicineStock.getReOrderLevel())
                .dosage(medicineStock.getDosage())
                .sellingPrice(medicineStock.getSellingPrice())
                .unitPurchase(medicineStock.getUnitPurchase())
                .expiryDate(DateUtils.parse(medicineStock.getExpiryDate()))
                .storageLocation(medicineStock.getStorageLocation())
                .purchaseQuantity(medicineStock.getPurchaseQuantity())
                .packageSize(medicineStock.getPackageSize())
                .build();
    }
}
