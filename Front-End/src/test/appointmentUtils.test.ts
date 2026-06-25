import { describe, it, expect } from "vitest";
import { AppointmentDto } from "@/services/appointmentService";

/**
 * Utility: filter appointments by status (mirrors what the UI does).
 */
function filterByStatus(
  appointments: AppointmentDto[],
  status: string
): AppointmentDto[] {
  return appointments.filter(
    (a) => a.status.toLowerCase() === status.toLowerCase()
  );
}

const sampleAppointments: AppointmentDto[] = [
  {
    id: 1,
    patientId: 10,
    patientName: "Alice",
    doctorId: 20,
    doctorName: "Dr. Smith",
    department: "Cardiology",
    appointmentDate: "2026-05-01",
    appointmentTime: "09:00",
    type: "consultation",
    status: "PENDING",
  },
  {
    id: 2,
    patientId: 11,
    patientName: "Bob",
    doctorId: 21,
    doctorName: "Dr. Jones",
    department: "Neurology",
    appointmentDate: "2026-05-02",
    appointmentTime: "10:30",
    type: "follow-up",
    status: "CONFIRMED",
  },
  {
    id: 3,
    patientId: 12,
    patientName: "Carol",
    doctorId: 20,
    doctorName: "Dr. Smith",
    department: "Cardiology",
    appointmentDate: "2026-05-03",
    appointmentTime: "14:00",
    type: "consultation",
    status: "COMPLETED",
  },
  {
    id: 4,
    patientId: 10,
    patientName: "Alice",
    doctorId: 22,
    doctorName: "Dr. Lee",
    department: "Orthopedics",
    appointmentDate: "2026-05-04",
    appointmentTime: "11:00",
    type: "emergency",
    status: "CANCELLED",
  },
];

describe("filterByStatus", () => {
  it("returns only PENDING appointments", () => {
    const result = filterByStatus(sampleAppointments, "PENDING");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("returns only CONFIRMED appointments", () => {
    const result = filterByStatus(sampleAppointments, "CONFIRMED");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("returns only COMPLETED appointments", () => {
    const result = filterByStatus(sampleAppointments, "COMPLETED");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("returns only CANCELLED appointments", () => {
    const result = filterByStatus(sampleAppointments, "CANCELLED");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it("is case-insensitive", () => {
    expect(filterByStatus(sampleAppointments, "pending")).toHaveLength(1);
    expect(filterByStatus(sampleAppointments, "Confirmed")).toHaveLength(1);
  });

  it("returns empty array when no match", () => {
    expect(filterByStatus(sampleAppointments, "UNKNOWN")).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(filterByStatus([], "PENDING")).toHaveLength(0);
  });
});

describe("appointment data shape", () => {
  it("each appointment has required fields", () => {
    sampleAppointments.forEach((a) => {
      expect(a).toHaveProperty("id");
      expect(a).toHaveProperty("patientId");
      expect(a).toHaveProperty("doctorId");
      expect(a).toHaveProperty("appointmentDate");
      expect(a).toHaveProperty("appointmentTime");
      expect(a).toHaveProperty("status");
    });
  });
});
