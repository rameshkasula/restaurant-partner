import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useCreateRequest } from '@/hooks/useRequests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuildingStore,
  IconMapPin,
  IconArrowRight,
  IconCircleCheck,
  IconAlertCircle,
  IconLoader2,
} from '@tabler/icons-react';
import { BrandLogo } from '@/components/BrandLogo';
import { APP_NAME } from '@/utils/constants';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'form' | 'success';

interface FormData {
  name: string;
  email: string;
  mobile: string;
  restaurantName: string;
  location: string;
}

// ─── Field component (label + input + error) ──────────────────────────────────
const FormField = React.forwardRef<
  HTMLInputElement,
  {
    id: string;
    label: string;
    icon: React.ElementType;
    error?: string;
  } & React.ComponentProps<'input'>
>(({ id, label, icon: Icon, error, className, ...inputProps }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          stroke={1.75}
        />
        <Input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          className={cn('pl-8', className)}
          {...inputProps}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <IconAlertCircle className="size-3 shrink-0" stroke={2} />
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <IconCircleCheck className="size-9 text-primary" stroke={1.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">You're on the list, {name.split(' ')[0]}!</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Thanks for your interest in {APP_NAME}. We're onboarding restaurants in phases —
          we'll reach out to you very soon with your access details.
        </p>
      </div>
      <Alert className="border-primary/20 bg-primary/5 text-left">
        <IconCircleCheck className="size-4 text-primary" stroke={1.75} />
        <AlertTitle className="text-primary">What happens next?</AlertTitle>
        <AlertDescription className="text-primary/80">
          Our team will review your application and contact you at your registered mobile number
          within 2–3 business days to complete onboarding.
        </AlertDescription>
      </Alert>
      <Link to="/" className="w-full">
        <Button variant="outline" className="w-full gap-2">
          Back to Home
          <IconArrowRight className="size-3.5" />
        </Button>
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Register() {
  const [step, setStep] = useState<Step>('form');
  const [apiError, setApiError] = useState('');

  const { mutateAsync: createRequest, isPending: loading } = useCreateRequest();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      restaurantName: '',
      location: '',
    },
  });

  const watchName = watch('name');

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      // Split location into city and state if comma separated
      const locationParts = data.location.split(',');
      const city = locationParts[0]?.trim() || undefined;
      const state = locationParts[1]?.trim() || undefined;

      await createRequest({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: `+91${data.mobile.trim()}`,
        restaurantName: data.restaurantName.trim(),
        city,
        state,
      });

      setStep('success');
    } catch (err: unknown) {
      let errMsg = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string | string[] };
        if (typeof data.message === 'string') {
          errMsg = data.message;
        } else if (Array.isArray(data.message) && data.message.length > 0) {
          errMsg = data.message[0];
        }
      }
      setApiError(errMsg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Ambient blob */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>

        <Card className="shadow-xl shadow-black/5">
          <CardHeader className="pb-5">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  {step === 'form' ? 'Request Early Access' : 'Application Received'}
                </CardTitle>
                {step === 'form' && (
                  <CardDescription className="mt-1 text-xs">
                    Join the waitlist — we'll reach out soon.
                  </CardDescription>
                )}
              </div>
              {step === 'form' && (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  <span className="mr-1.5 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  Beta Open
                </Badge>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            {step === 'success' ? (
              <SuccessScreen name={watchName} />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                {apiError && (
                  <Alert variant="destructive">
                    <IconAlertCircle className="size-4" stroke={2} />
                    <AlertDescription>{apiError}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  id="name"
                  label="Full Name"
                  icon={IconUser}
                  placeholder="Arjun Mehta"
                  error={errors.name?.message}
                  autoComplete="name"
                  autoFocus
                  {...register('name', {
                    required: 'Full name is required.',
                    onChange: () => {
                      if (apiError) setApiError('');
                    },
                  })}
                />

                <FormField
                  id="email"
                  label="Email Address"
                  icon={IconMail}
                  placeholder="arjun@example.com"
                  error={errors.email?.message}
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email address is required.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address.',
                    },
                    onChange: () => {
                      if (apiError) setApiError('');
                    },
                  })}
                />

                <FormField
                  id="mobile"
                  label="Mobile Number"
                  icon={IconPhone}
                  placeholder="98765 43210"
                  error={errors.mobile?.message}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  {...register('mobile', {
                    required: 'Mobile number is required.',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter a valid 10-digit Indian mobile number.',
                    },
                    onChange: () => {
                      if (apiError) setApiError('');
                    },
                  })}
                />

                <FormField
                  id="restaurantName"
                  label="Restaurant Name"
                  icon={IconBuildingStore}
                  placeholder="Spice Garden"
                  error={errors.restaurantName?.message}
                  autoComplete="organization"
                  {...register('restaurantName', {
                    required: 'Restaurant name is required.',
                    onChange: () => {
                      if (apiError) setApiError('');
                    },
                  })}
                />

                <FormField
                  id="location"
                  label="Location / City"
                  icon={IconMapPin}
                  placeholder="Bengaluru, Karnataka"
                  error={errors.location?.message}
                  autoComplete="address-level2"
                  {...register('location', {
                    required: 'Location is required.',
                    onChange: () => {
                      if (apiError) setApiError('');
                    },
                  })}
                />

                <Button
                  type="submit"
                  className="mt-2 w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" stroke={2} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Request Early Access
                      <IconArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          By continuing, you agree to our{' '}
          <a href="#" className="hover:text-foreground underline underline-offset-4">
            Terms of Service
          </a>{' '}
          &amp;{' '}
          <a href="#" className="hover:text-foreground underline underline-offset-4">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
