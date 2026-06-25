import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning';
  change?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, variant = 'primary', change }) => {
  const variantClasses = {
    primary: 'stat-card-primary',
    accent: 'stat-card-accent',
    success: 'stat-card-success',
    warning: 'stat-card-warning',
  };

  return (
    <div className={cn('stat-card', variantClasses[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && <p className="text-xs mt-2 opacity-80">{change}</p>}
        </div>
        <div className="p-3 bg-white/20 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
