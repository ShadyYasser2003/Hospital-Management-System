import { describe, it, expect } from "vitest";
import { getRoleDashboardPath } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

describe("getRoleDashboardPath", () => {
  const cases: [UserRole, string][] = [
    ["admin",        "/admin"],
    ["doctor",       "/doctor"],
    ["nurse",        "/nurse"],
    ["receptionist", "/receptionist"],
    ["pharmacist",   "/pharmacist"],
    ["accountant",   "/accountant"],
    ["technician",   "/technician"],
    ["patient",      "/patient"],
  ];

  it.each(cases)("role '%s' → path '%s'", (role, expectedPath) => {
    expect(getRoleDashboardPath(role)).toBe(expectedPath);
  });
});
