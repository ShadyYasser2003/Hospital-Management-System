import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'active' | 'pending' | 'inactive' | 'urgent';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant }) => {
  const getVariant = () => {
    if (variant) return variant;
    const statusLower = status.toLowerCase();
    if (['active', 'confirmed', 'completed', 'paid', 'dispensed', 'approved', 'in-stock'].includes(statusLower)) return 'active';
    if (['pending', 'in-progress', 'partial', 'low-stock'].includes(statusLower)) return 'pending';
    if (['inactive', 'cancelled', 'rejected', 'out-of-stock'].includes(statusLower)) return 'inactive';
    if (['urgent', 'emergency'].includes(statusLower)) return 'urgent';
    return 'pending';
  };

  const variantClasses = {
    active: 'status-active',
    pending: 'status-pending',
    inactive: 'status-inactive',
    urgent: 'status-urgent',
  };

  return (
    <span className={cn('status-badge capitalize', variantClasses[getVariant()])}>
      {status.replace(/-/g, ' ')}
    </span>
  );
};

export default StatusBadge;
