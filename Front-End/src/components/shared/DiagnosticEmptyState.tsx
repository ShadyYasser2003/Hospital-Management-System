import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DiagnosticEmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

const DiagnosticEmptyState: React.FC<DiagnosticEmptyStateProps> = ({ message, icon, className }) => (
  <Card className={cn(className)}>
    <CardContent className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      {icon && <div className="opacity-30">{icon}</div>}
      <p className="text-sm">{message}</p>
    </CardContent>
  </Card>
);

export default DiagnosticEmptyState;
