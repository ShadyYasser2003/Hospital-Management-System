package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class MedicineStockDto {
    private Long id;
    private String manufacturer;
    private Integer reOrderLevel;
    private Double sellingPrice;
    private Double unitPurchase;
    private String medicineForm;
    private String expiryDate;       // String — parsed manually
    private String storageLocation;
    private String dosage;
    private String packageSize;
    private Integer purchaseQuantity;
    private Integer currentQuantity;
    private Long medicineId;
}
