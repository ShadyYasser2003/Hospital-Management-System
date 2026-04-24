package com.hospital.hms.service.implementation;

import com.hospital.hms.dto.MedicineStockDto;
import com.hospital.hms.entity.Medicine;
import com.hospital.hms.entity.MedicineStock;
import com.hospital.hms.mapper.MedicineStockMapper;
import com.hospital.hms.repository.MedicineRepository;
import com.hospital.hms.repository.MedicineStockRepository;
import com.hospital.hms.service.MedicineStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineStockServiceImpl implements MedicineStockService {
    private final MedicineStockRepository repository;
    private final MedicineRepository medicineRepository;
    @Override
    public List<MedicineStockDto> getAllMedicineStocks() {
        return repository.findAll()
                .stream().map(MedicineStockMapper::mapToDto).toList();
    }

    @Override
    public MedicineStockDto getMedicineStockById(Long id) {
        MedicineStock stock= repository.findById(id)
                .orElseThrow(()-> new RuntimeException("Medicine not found with id: "+id));
        return MedicineStockMapper.mapToDto(stock);
    }

    @Override
    public MedicineStockDto createMedicineStock(MedicineStockDto medicineStockDto) {

        MedicineStock stock= new MedicineStock();
        stock.setManufacturer(medicineStockDto.getManufacturer());
        stock.setCurrentQuantity(medicineStockDto.getCurrentQuantity());
        stock.setReOrderLevel(medicineStockDto.getReOrderLevel());
        stock.setSellingPrice(medicineStockDto.getSellingPrice());
        stock.setMedicineForm(medicineStockDto.getMedicineForm());
        stock.setUnitPurchase(medicineStockDto.getUnitPurchase());
        stock.setStorageLocation(medicineStockDto.getStorageLocation());
        stock.setExpiryDate(com.hospital.hms.config.DateUtils.parse(medicineStockDto.getExpiryDate()));
        stock.setDosage(medicineStockDto.getDosage());
        stock.setPackageSize(medicineStockDto.getPackageSize());
        if(medicineStockDto.getPurchaseQuantity() == null){
            stock.setPurchaseQuantity(500);
        }
        stock.setPurchaseQuantity(medicineStockDto.getPurchaseQuantity());
        stock.setCurrentQuantity(medicineStockDto.getPurchaseQuantity());
        Medicine medicine= medicineRepository.findById(medicineStockDto.getMedicineId())
                .orElseThrow(()->new RuntimeException("Medicine not found with id: "+medicineStockDto.getMedicineId()));
        medicine.addStock(stock);
        medicineRepository.save(medicine);
        return MedicineStockMapper.mapToDto(repository.save(stock));
    }
    @Override
    public List<MedicineStockDto> getALlStocksOfMedicine(Long medicineId){
        Medicine medicine= medicineRepository.findById(medicineId)
                .orElseThrow(()->new RuntimeException("Medicine not found with id: "+medicineId));
        List<MedicineStock> stockList= medicine.getMedicineStocks();
        if(stockList == null){
            return Collections.emptyList();
        }
        return stockList.stream().map(MedicineStockMapper:: mapToDto).toList();
    }
    @Override
    public MedicineStockDto updateMedicineStock(Long id, String operation, int quantity) {
        if(operation.isEmpty() || operation.trim().isBlank()){
            throw new IllegalArgumentException("Invalid String: operation empty\nInvalid operation: please conform to the specified format of operation:\n+ >> addition or add\n- >> or subtraction or sub");
        }
        operation= operation.trim().toLowerCase();
        MedicineStock existingMedicineStock= repository.findById(id)
                .orElseThrow(()->new RuntimeException("Medicine Stock not found with id: " + id));
        int currentQuantity= this.getCurrentQuantity(operation, quantity, existingMedicineStock);
        existingMedicineStock.setCurrentQuantity(currentQuantity);
        return MedicineStockMapper.mapToDto(repository.save(existingMedicineStock));
    }

    private int getCurrentQuantity(String operation, int quantity, MedicineStock existingMedicineStock) {
        int currentQuantity= existingMedicineStock.getCurrentQuantity();
        //specify input format at front level!!
        if(operation.equals("subtract")|| operation.equals("sub")){
            currentQuantity= (currentQuantity >= quantity)? currentQuantity- quantity : 0;
        }else if(operation.equals("addition")|| operation.equals("add")){
            currentQuantity+= quantity;
        }else {
            throw new IllegalArgumentException("Invalid operation: please conform to the specified format of operation:\n+ >> addition or add\n- >> or subtraction or sub");
        }
        return currentQuantity;
    }

    @Override
    public void deleteMedicineStock(Long id) {
        MedicineStock stock= repository.findById(id)
                .orElseThrow(()-> new RuntimeException("Medicine not found with id: "+id));
        repository.delete(stock);
    }

    @Override
    public List<MedicineStockDto> getLowStockMedicines() {
        List<MedicineStock> stockList= repository.findAll();
        List<MedicineStockDto> lowStockMedicine= new ArrayList<>();
        if(stockList.isEmpty()){
            throw new RuntimeException("There are no medicine currently in stock! Add medicines please!");
        }

        for(MedicineStock stock:stockList){
            if(stock.getCurrentQuantity()<= stock.getReOrderLevel()){
                lowStockMedicine.add(MedicineStockMapper.mapToDto(stock));
            }
        }
        return lowStockMedicine;
    }

    @Override
    public List<MedicineStockDto> getExpiringMedicineStock(int days) {
        List<MedicineStock> stockList= repository.findAllByOrderByExpiryDateAsc();
        List<MedicineStockDto> expiringStocks= new ArrayList<>();
        if(stockList.isEmpty()){
            throw new RuntimeException("There are no medicine currently in stock! Add medicines please!");
        }
        LocalDate now= LocalDate.now();
        for(MedicineStock stock:stockList){
            LocalDate expiryDate= stock.getExpiryDate();
            long difference= ChronoUnit.DAYS.between(expiryDate, now);
            if(stock.getExpiryDate().isAfter(LocalDate.now())){
                if (difference <= days) {
                    expiringStocks.add(MedicineStockMapper.mapToDto(stock));
                } else {
                    break;
                }
            }else{
                throw new RuntimeException("Medicine Stock already expired with id+ "+stock.getId()
                        +"\n"+stock);
            }
        }
        return expiringStocks;
    }

}
