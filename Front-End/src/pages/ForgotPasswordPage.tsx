import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '@/services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
      toast.success('Temporary password sent to your email');
    } catch {
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent you instructions to reset your password">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>

            <p className="text-muted-foreground mb-6">
              If an account exists for:
              <br />
              <strong className="text-foreground">{email}</strong>
              <br /><br />
              A temporary password has been sent. Log in with it and change your
              password immediately from your profile settings.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
              >
                Try a different email
              </Button>
              
              <Link to="/login" className="block">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive reset instructions">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address"
                  className={`pl-10 h-11 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Reset Instructions'
              )}
            </Button>

            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full h-11">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
