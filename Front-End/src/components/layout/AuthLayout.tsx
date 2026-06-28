import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Heart, Shield, Clock } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white/30 rounded-full" />
          <div className="absolute top-40 right-20 w-48 h-48 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 left-20 w-24 h-24 border border-white/25 rounded-full" />
          <div className="absolute bottom-40 right-40 w-40 h-40 border border-white/15 rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <Link to="/home" className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building2 className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MediCore</h1>
              <p className="text-sm text-white/80">Hospital Management System</p>
            </div>
          </Link>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Complete Healthcare
            <br />
            Management Solution
          </h2>
          
          <p className="text-lg text-white/90 mb-10 max-w-md">
            Streamline your hospital operations with our comprehensive management system designed for modern healthcare.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Heart className="h-5 w-5" />
              </div>
              <span>Patient-centered care management</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <span>Secure role-based access control</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <span>Real-time updates & notifications</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/home" className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </Link>
            <h1 className="text-xl font-bold">MediCore</h1>
            <p className="text-sm text-muted-foreground">Hospital Management System</p>
          </div>
          
          {/* Title */}
          {title && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          )}
          
          {children}
          
          <p className="text-center mt-8 text-sm text-muted-foreground">
            <Link to="/home" className="hover:text-primary transition-colors">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
