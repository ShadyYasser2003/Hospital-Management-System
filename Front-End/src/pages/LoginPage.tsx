import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '@/contexts/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, Users, UserCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPatientPortal = searchParams.get('type') === 'patient';

  const { login, logout, isAuthenticated, user } = useAuth();
  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboardPath(user.role));
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!usernameOrId.trim()) {
      newErrors.username = 'Username or National ID is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const result = await login(usernameOrId.trim(), password);
    if (result.success) {
      const loggedInUser = result.user;
      if (loggedInUser) {
        const isPatient = loggedInUser.role === 'patient';
        if (!isPatientPortal && isPatient) {
          logout();
          toast.error('Patients must use the Patient Portal.');
          setLoading(false);
          return;
        }
        if (isPatientPortal && !isPatient) {
          logout();
          toast.error('Staff members must use the Staff Login.');
          setLoading(false);
          return;
        }
      }
      toast.success('Login successful! Redirecting...');
    } else {
      // Always show a generic message — never leak whether username or password was wrong
      const msg = result.error ?? '';
      if (msg.toLowerCase().includes('deactivated')) {
        toast.error('Account is deactivated. Contact administrator.');
      } else {
        toast.error('Invalid username or password.');
      }
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      title={isPatientPortal ? 'Patient Portal' : 'Staff Login'}
      subtitle={isPatientPortal ? 'Access your health records and appointments' : 'Sign in to access your dashboard'}
    >
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">

          {/* Switch link */}
          <div className="flex justify-end mb-5">
            <button
              type="button"
              onClick={() => navigate(isPatientPortal ? '/login' : '/login?type=patient')}
              className="text-xs text-primary hover:underline font-medium"
            >
              {isPatientPortal ? 'Staff Login →' : 'Patient Portal →'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="usernameOrId" className="text-sm font-medium">
                {isPatientPortal ? 'Username or National ID' : 'Username or National ID'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="usernameOrId"
                  value={usernameOrId}
                  onChange={(e) => {
                    setUsernameOrId(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  placeholder="Enter username or national ID"
                  className={`pl-10 h-11 ${errors.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Enter password"
                  className={`pl-10 pr-10 h-11 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {isPatientPortal ? 'Access Portal' : 'Sign In'}
                </span>
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
