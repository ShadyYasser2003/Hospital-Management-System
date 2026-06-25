/** Shared helpers for the Blood Bank module */

export const BLOOD_TYPES: { label: string; value: string }[] = [
  { label: 'A+',  value: 'A_POSITIVE'  },
  { label: 'A−',  value: 'A_NEGATIVE'  },
  { label: 'B+',  value: 'B_POSITIVE'  },
  { label: 'B−',  value: 'B_NEGATIVE'  },
  { label: 'AB+', value: 'AB_POSITIVE' },
  { label: 'AB−', value: 'AB_NEGATIVE' },
  { label: 'O+',  value: 'O_POSITIVE'  },
  { label: 'O−',  value: 'O_NEGATIVE'  },
];

export const URGENCY_LEVELS: { label: string; value: string }[] = [
  { label: 'Low',    value: 'LOW'    },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High',   value: 'HIGH'   },
];

export const UNIT_STATUSES: { label: string; value: string }[] = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Reserved',  value: 'RESERVED'  },
  { label: 'Used',      value: 'USED'      },
  { label: 'Expired',   value: 'EXPIRED'   },
];

/** Convert "A_POSITIVE" → "A+" for display */
export function fmtBloodType(raw?: string | null): string {
  if (!raw) return '—';
  const map: Record<string, string> = {
    A_POSITIVE:  'A+',
    A_NEGATIVE:  'A−',
    B_POSITIVE:  'B+',
    B_NEGATIVE:  'B−',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB−',
    O_POSITIVE:  'O+',
    O_NEGATIVE:  'O−',
  };
  return map[raw] ?? raw.replace('_', ' ');
}

/** Convert "HIGH" urgency → display label */
export function fmtUrgency(raw?: string | null): string {
  if (!raw) return '—';
  const map: Record<string, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
  return map[raw] ?? raw;
}

/** "yyyy-MM-dd HH:mm" → human readable */
export function fmtDateTime(raw?: string | null): string {
  if (!raw) return '—';
  return raw.replace('T', ' ').slice(0, 16);
}

/** Days until expiry (negative = already expired) */
export function daysUntilExpiry(expiryDate?: string | null): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / 86_400_000);
}

/** Returns true when a blood unit is usable */
export function isAvailable(status?: string | null): boolean {
  return status === 'AVAILABLE';
}

/** CSS urgency colour class */
export function urgencyColor(urgency?: string): string {
  if (urgency === 'HIGH')   return 'text-red-600 bg-red-50 border-red-200';
  if (urgency === 'MEDIUM') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-green-700 bg-green-50 border-green-200';
}

/** Summarise inventory: total available units per blood type */
export function inventorySummary(
  units: { bloodType: string; quantity: number; status: string; expiryDate?: string }[],
): Record<string, number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const summary: Record<string, number> = {};
  for (const u of units) {
    if (u.status !== 'AVAILABLE') continue;
    if (u.expiryDate) {
      const exp = new Date(u.expiryDate);
      exp.setHours(0, 0, 0, 0);
      if (exp < today) continue;
    }
    summary[u.bloodType] = (summary[u.bloodType] ?? 0) + u.quantity;
  }
  return summary;
}
