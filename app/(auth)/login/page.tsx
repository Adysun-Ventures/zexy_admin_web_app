'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const [step, setStep] = useState<'contact' | 'otp'>('contact');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { login } = useAuth();
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (step === 'otp') {
      otpInputRefs[0].current?.focus();
    }
  }, [step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate Indian mobile number
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobile)) {
        toast.error('Please enter a valid 10-digit Indian mobile number starting with 6-9');
        setIsLoading(false);
        return;
      }

      const response = await authApi.sendOTP({ mobile });
      if (response.success) {
        toast.success('OTP sent successfully!');
        setStep('otp');
        setCountdown(60);
        
        // Start countdown
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const otpString = otp.join('');
      const response = await authApi.verifyOTP({ mobile, otp: otpString });
      if (response.success && response.data?.access_token) {
        const user = {
          id: '1',
          mobile: mobile,
          role: 'admin',
        };
        login(response.data.access_token, user);
        toast.success('Login successful!');
      router.push('/notification_list');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      // Validate Indian mobile number
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobile)) {
        toast.error('Please enter a valid 10-digit Indian mobile number starting with 6-9');
        setIsLoading(false);
        return;
      }

      const response = await authApi.sendOTP({ mobile });
      if (response.success) {
        toast.success('OTP resent successfully!');
        setOtp(['', '', '', '']);
        otpInputRefs[0].current?.focus();
        setCountdown(60);
        
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-3xl font-bold">Zexy Admin</CardTitle>
          <CardDescription className="text-base">
            {step === 'contact' 
              ? 'Enter your mobile number to receive OTP' 
              : 'Enter the OTP sent to your mobile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'contact' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => {
                    // Only allow digits and limit to 10 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(value);
                  }}
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Enter 10-digit Indian mobile number (starting with 6-9)
                </p>
              </div>
              
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-center block">Enter 4-Digit OTP</Label>
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={otpInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('contact');
                    setOtp(['', '', '', '']);
                  }}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Change mobile
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11" 
                disabled={isLoading || otp.join('').length !== 4}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
