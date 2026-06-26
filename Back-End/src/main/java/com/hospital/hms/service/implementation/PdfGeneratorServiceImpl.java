package com.hospital.hms.service.implementation;

import com.hospital.hms.entity.LabTest;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.RadiologyOrder;
import com.hospital.hms.entity.TransferRequest;
import com.hospital.hms.service.PdfGeneratorService;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
@Service
public class PdfGeneratorServiceImpl implements PdfGeneratorService {

    @Value("${hospital.name:Our Hospital}")
    private String hospitalName;

    private static final DateTimeFormatter DT_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final DeviceRgb HEADER_COLOR  = new DeviceRgb(23, 97, 154);   // أزرق
    private static final DeviceRgb SECTION_COLOR = new DeviceRgb(52, 152, 219);  // أزرق فاتح
    private static final DeviceRgb ROW_ALT_COLOR = new DeviceRgb(236, 246, 253); // رمادي فاتح


    @Override
    public byte[] generateTransferPdf(TransferRequest transfer, Patient patient, List<LabTest> labTests, List<RadiologyOrder> radiologyOrders) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer   = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document  = new Document(pdfDoc);
            document.setMargins(36, 50, 36, 50);

            addHeader(document, transfer);

            addTransferInfo(document, transfer);

            addSectionTitle(document, "Patient Information");
            addPatientInfo(document, patient);


            if (hasVitals(patient)) {
                addSectionTitle(document, "Vital Signs");
                addVitals(document, patient);
            }

            if (transfer.getIncludeDiagnoses()) {
                addSectionTitle(document, "Medical History & Diagnosis");
                addMedicalInfo(document, patient);
            }

            if (transfer.getIncludeLabTests() && !labTests.isEmpty()) {
                addSectionTitle(document, "Lab Tests");
                addLabTests(document, labTests);
            }

            if (transfer.getIncludeRadiology() && !radiologyOrders.isEmpty()) {
                addSectionTitle(document, "Radiology Orders");
                addRadiologyOrders(document, radiologyOrders);
            }

            addFooter(document, transfer);

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }


    private void addHeader(Document doc, TransferRequest transfer) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(Border.NO_BORDER);

        Cell leftCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph(hospitalName)
                        .setFontSize(20).setBold()
                        .setFontColor(HEADER_COLOR))
                .add(new Paragraph("PATIENT TRANSFER RECORD")
                        .setFontSize(12).setBold()
                        .setFontColor(ColorConstants.DARK_GRAY));

        Cell rightCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("Transfer #" + transfer.getId())
                        .setFontSize(11).setBold()
                        .setFontColor(HEADER_COLOR))
                .add(new Paragraph("Date: " + LocalDateTime.now().format(DT_FORMAT))
                        .setFontSize(9)
                        .setFontColor(ColorConstants.GRAY));

        headerTable.addCell(leftCell);
        headerTable.addCell(rightCell);
        doc.add(headerTable);

        doc.add(new Paragraph("\n")
                .setBorderBottom(new SolidBorder(HEADER_COLOR, 2))
                .setMarginBottom(10));
    }


    private void addTransferInfo(Document doc, TransferRequest transfer) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        table.addCell(infoCell("From Hospital:", hospitalName));
        table.addCell(infoCell("To Hospital:", transfer.getToHospitalName()));
        table.addCell(infoCell("Requested By:", transfer.getRequestedByName()));
        table.addCell(infoCell("To Hospital Email:", transfer.getToHospitalEmail()));
        table.addCell(infoCell("Reason:", transfer.getReason() != null
                ? transfer.getReason() : "—").setBackgroundColor(ROW_ALT_COLOR));
        table.addCell(infoCell("Transferred At:",
                transfer.getTransferredAt() != null
                        ? transfer.getTransferredAt().format(DT_FORMAT)
                        : LocalDateTime.now().format(DT_FORMAT))
                .setBackgroundColor(ROW_ALT_COLOR));

        doc.add(table);
    }


    private void addPatientInfo(Document doc, Patient patient) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addRow(table, "Full Name",    safeVal(patient.getName()),          false);
        addRow(table, "National ID",  safeVal(patient.getNationalId()),    true);
        addRow(table, "Date of Birth",
                patient.getDateOfBirth() != null
                        ? patient.getDateOfBirth().toString() : "—",      false);
        addRow(table, "Gender",
                patient.getGender() != null
                        ? patient.getGender().toString() : "—",           true);
        addRow(table, "Blood Type",   safeVal(patient.getBloodType()),     false);
        addRow(table, "Phone",        safeVal(patient.getPhone()),         true);
        addRow(table, "Email",        safeVal(patient.getEmail()),         false);
        addRow(table, "Address",      safeVal(patient.getAddress()),       true);
        addRow(table, "Emergency Contact", safeVal(patient.getEmergencyContact()), false);
        addRow(table, "Allergies",    safeVal(patient.getAllergies()),      true);
        addRow(table, "Insurance",
                patient.getInsuranceProvider() != null
                        ? patient.getInsuranceProvider() + " - " + safeVal(patient.getInsuranceNumber())
                        : "—",                                             false);

        doc.add(table);
    }


    private void addVitals(Document doc, Patient patient) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addRow(table, "Blood Pressure", safeVal(patient.getBloodPressure()), false);
        addRow(table, "Temperature",    safeVal(patient.getTemperature()),   true);
        addRow(table, "Pulse",          safeVal(patient.getPulse()),         false);
        addRow(table, "Weight",         safeVal(patient.getWeight()),        true);
        addRow(table, "Height",         safeVal(patient.getHeight()),        false);

        doc.add(table);
    }


    private void addMedicalInfo(Document doc, Patient patient) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        addRow(table, "Medical History", safeVal(patient.getMedicalHistory()), false);
        addRow(table, "Diagnosis",       safeVal(patient.getDiagnosis()),      true);
        addRow(table, "Notes",           safeVal(patient.getNotes()),          false);

        doc.add(table);
    }


    private void addLabTests(Document doc, List<LabTest> labTests) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{25, 20, 25, 15, 15}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        // Header row
        String[] headers = {"Test Name", "Type", "Result", "Status", "Date"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .setBackgroundColor(SECTION_COLOR)
                    .setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setFontSize(9)
                    .add(new Paragraph(h)));
        }

        boolean alt = false;
        for (LabTest test : labTests) {
            DeviceRgb bg = alt ? ROW_ALT_COLOR : null;
            table.addCell(coloredCell(safeVal(test.getTestName()), bg));
            table.addCell(coloredCell(test.getTestType() != null
                    ? test.getTestType().toString() : "—", bg));
            table.addCell(coloredCell(safeVal(test.getResult()), bg));
            table.addCell(coloredCell(test.getStatus() != null
                    ? test.getStatus().toString() : "—", bg));
            table.addCell(coloredCell(test.getCompletedAt() != null
                    ? test.getCompletedAt().format(DT_FORMAT) : "—", bg));
            alt = !alt;
        }

        doc.add(table);
    }


    private void addRadiologyOrders(Document doc, List<RadiologyOrder> orders) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{20, 20, 30, 15, 15}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(15);

        String[] headers = {"Type", "Body Part", "Findings", "Status", "Date"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .setBackgroundColor(SECTION_COLOR)
                    .setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setFontSize(9)
                    .add(new Paragraph(h)));
        }

        boolean alt = false;
        for (RadiologyOrder order : orders) {
            DeviceRgb bg = alt ? ROW_ALT_COLOR : null;
            table.addCell(coloredCell(order.getOrderType() != null
                    ? order.getOrderType().toString() : "—", bg));
            table.addCell(coloredCell(safeVal(order.getBodyPart()), bg));
            table.addCell(coloredCell(safeVal(order.getReportFindings()), bg));
            table.addCell(coloredCell(order.getStatus() != null
                    ? order.getStatus().toString() : "—", bg));
            table.addCell(coloredCell(order.getCompletedAt() != null
                    ? order.getCompletedAt().format(DT_FORMAT) : "—", bg));
            alt = !alt;
        }

        doc.add(table);
    }


    private void addFooter(Document doc, TransferRequest transfer) {
        doc.add(new Paragraph("\n")
                .setBorderTop(new SolidBorder(HEADER_COLOR, 1))
                .setMarginTop(20));

        doc.add(new Paragraph(
                "This document was generated automatically by " + hospitalName +
                        " HMS on " + LocalDateTime.now().format(DT_FORMAT) +
                        ". For inquiries, contact the issuing hospital.")
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER));
    }



    private void addSectionTitle(Document doc, String title) {
        doc.add(new Paragraph(title)
                .setFontSize(11)
                .setBold()
                .setFontColor(ColorConstants.WHITE)
                .setBackgroundColor(HEADER_COLOR)
                .setPadding(5)
                .setMarginTop(10)
                .setMarginBottom(5));
    }


    private Cell infoCell(String label, String value) {
        return new Cell()
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))
                .add(new Paragraph(label).setBold().setFontSize(9)
                        .setFontColor(HEADER_COLOR))
                .add(new Paragraph(value != null ? value : "—").setFontSize(9));
    }

    private void addRow(Table table, String label, String value, boolean alt) {
        DeviceRgb bg = alt ? ROW_ALT_COLOR : null;
        Cell labelCell = new Cell()
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))
                .add(new Paragraph(label).setBold().setFontSize(9)
                        .setFontColor(HEADER_COLOR));
        Cell valueCell = new Cell()
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))
                .add(new Paragraph(value != null ? value : "—").setFontSize(9));

        if (bg != null) {
            labelCell.setBackgroundColor(bg);
            valueCell.setBackgroundColor(bg);
        }
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private Cell coloredCell(String value, DeviceRgb bg) {
        Cell cell = new Cell()
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))
                .add(new Paragraph(value != null ? value : "—").setFontSize(9));
        if (bg != null) cell.setBackgroundColor(bg);
        return cell;
    }


    private String safeVal(String value) {
        return (value != null && !value.isBlank()) ? value : "—";
    }

    private boolean hasVitals(Patient patient) {
        return patient.getBloodPressure() != null
                || patient.getTemperature() != null
                || patient.getPulse() != null
                || patient.getWeight() != null
                || patient.getHeight() != null;
    }
    }






