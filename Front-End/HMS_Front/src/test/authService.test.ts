import { describe, it, expect } from "vitest";
import { mapRole } from "@/services/authService";

describe("mapRole", () => {
  it("maps ADMIN to admin", () => {
    expect(mapRole("ADMIN")).toBe("admin");
  });

  it("maps DOCTOR to doctor", () => {
    expect(mapRole("DOCTOR")).toBe("doctor");
  });

  it("maps NURSE to nurse", () => {
    expect(mapRole("NURSE")).toBe("nurse");
  });

  it("maps RECEPTIONIST to receptionist", () => {
    expect(mapRole("RECEPTIONIST")).toBe("receptionist");
  });

  it("maps PHARMACIST to pharmacist", () => {
    expect(mapRole("PHARMACIST")).toBe("pharmacist");
  });

  it("maps ACCOUNTANT to accountant", () => {
    expect(mapRole("ACCOUNTANT")).toBe("accountant");
  });

  it("maps TECHNICIAN to technician", () => {
    expect(mapRole("TECHNICIAN")).toBe("technician");
  });

  it("maps PATIENT to patient", () => {
    expect(mapRole("PATIENT")).toBe("patient");
  });

  it("is case-insensitive (lowercase input)", () => {
    expect(mapRole("doctor")).toBe("doctor");
    expect(mapRole("admin")).toBe("admin");
  });

  it("falls back to patient for unknown roles", () => {
    expect(mapRole("UNKNOWN_ROLE")).toBe("patient");
    expect(mapRole("")).toBe("patient");
  });
});
