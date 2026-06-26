/**
 * DiagnosticOrderMeta.tsx
 *
 * Renders the 2×N info grid shown at the top of every lab/radiology dialog
 * (patient, doctor, ordered date, etc.). Eliminates the ~6 copy-pasted grids
 * spread across TechnicianRequests, TechnicianUpload, DoctorTests, DoctorReports.
 *
 * Usage:
 *   <DiagnosticOrderMeta items={[
 *     { label: 'Patient', value: dto.patientName },
 *     { label: 'Test',    value: dto.testType },
 *     { label: 'Doctor',  value: dto.doctorName },
 *     { label: 'Ordered', value: fmtDate(dto.orderedAt) },
 *   ]} />
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface MetaItem {
  label: string;
  value?: string | null;
  /** Span the full row width (2 columns). Default false. */
  fullWidth?: boolean;
}

interface DiagnosticOrderMetaProps {
  items: MetaItem[];
  className?: string;
}

const DiagnosticOrderMeta: React.FC<DiagnosticOrderMetaProps> = ({ items, className }) => (
  <div className={cn('grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg text-sm', className)}>
    {items.map(({ label, value, fullWidth }) => (
      <div key={label} className={fullWidth ? 'col-span-2' : undefined}>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value ?? '—'}</p>
      </div>
    ))}
  </div>
);

export default DiagnosticOrderMeta;
