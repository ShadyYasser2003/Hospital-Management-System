import React from 'react';
import { Link } from 'react-router-dom';

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  to: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, to }) => {
  return (
    <Link to={to} className="quick-action">
      <div className="quick-action-icon">
        {icon}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </Link>
  );
};

export default QuickAction;
