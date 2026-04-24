package com.hospital.hms.entity;

import com.hospital.hms.Enum.MedicineStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String genericName;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MedicineStatus status = MedicineStatus.IN_STOCK;
    private Boolean prescriptionRequired=false;
    private String description;
    private String sideEffects;

    @Column(nullable = false, updatable = false)
    private LocalDate createdAt = LocalDate.now();
    private LocalDate updatedAt;
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }

    @ManyToMany(mappedBy = "medicineList")
    private List<MedicineCategory> categoryList= new ArrayList<>();
    @ManyToMany(mappedBy = "medicineList")
    private List<Pharmacist> pharmacists= new ArrayList<>();
    public void removeCategory(MedicineCategory category){
        this.categoryList.remove(category);
        category.getMedicineList().remove(this);
    }
    @OneToMany(mappedBy = "medicine", orphanRemoval = true)
    private List<MedicineStock> medicineStocks= new ArrayList<>();
    public void addStock(MedicineStock stock){
        this.getMedicineStocks().add(stock);
        stock.setMedicine(this);
    }
    @OneToMany(mappedBy = "medicine")
    private List<PrescriptionItem> items= new ArrayList<>();
}
