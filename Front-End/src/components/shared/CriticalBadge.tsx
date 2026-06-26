/**
 * CriticalBadge.tsx
 *
 * Single source of truth for the "Critical / Normal" badge.
 * Replaces the 8 different inline implementations across the codebase:
 *   - <Badge variant="destructive">Critical</Badge>
 *   - <AlertTriangle className="h-4 w-4 text-destructive" />
 *   - <span className="text-destructive font-semibold text-xs">Critical</span>
 *   - <span className="text-xs font-semibold text-destructive">⚠ Critical Result</span>
 *
 * Usage:
 *   <CriticalBadge isCritical={item.isCritical} />            // shows badge
 *   <CriticalBadge isCritical={item.isCritical} iconOnly />   // shows icon only (for table cells)
 *   <CriticalBadge isCritical={item.isCritical} showNormal /> // also show "Normal" badge when false
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface CriticalBadgeProps {
  isCritical?: boolean | null;
  /** Render only the warning icon, no text (compact table-cell mode). */
  iconOnly?: boolean;
  /** When false, render a "Normal" badge instead of nothing. */
  showNormal?: boolean;
}

const CriticalBadge: React.FC<CriticalBadgeProps> = ({
  isCritical,
  iconOnly = false,
  showNormal = false,
}) => {
  if (isCritical) {
    if (iconOnly) {
      return (
        <span title="Critical" aria-label="Critical" className="inline-flex">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </span>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" aria-hidden />
        Critical
      </Badge>
    );
  }

  if (showNormal) {
    return <Badge variant="secondary">Normal</Badge>;
  }

  return null;
};

export default CriticalBadge;
