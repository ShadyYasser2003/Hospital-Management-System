package com.hospital.hms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MedicineStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String manufacturer;
    @Column(nullable = false)
    private Integer reOrderLevel;
    @Column(nullable = false)
    private Double sellingPrice;
    private Double unitPurchase;  //price pharmacy paid for each unit
    private String medicineForm;  //tablets, syrup
    @Column(nullable = false)
    private LocalDate expiryDate;
    @Column(nullable = false)
    private String storageLocation;   //Aisle 3, shelf B
    private String dosage;             //how much to take each time tablet "50mg",syrup "25mg/5ml"
    private String packageSize;          // "box of 16 tablets", "100ml bottle"
    @Column(nullable = false)
    private Integer purchaseQuantity;    // How many purchase units
    private Integer currentQuantity;    //quantity after selling and dispensing the medicine
    @ManyToMany(mappedBy = "medicineStocks")
    private List<Pharmacist> pharmacists= new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;
}
