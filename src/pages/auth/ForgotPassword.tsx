import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  IconFlame,
  IconMail,
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconAlertCircle,
  IconMailCheck,
  IconRefresh,
  IconShieldCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  const visible = user.slice(0, 2);
  const masked = '*'.repeat(Math.max(0, user.length - 2));
  return `${visible}${masked}@${domain}`;
}

function useCountdown(initial: number) {
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setSeconds(initial);
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(ref.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);
  return { seconds, start };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'email' | 'verify-otp';

// ─── Step 1: Enter Email ──────────────────────────────────────────────────────
function EmailStep({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!email.trim()) { setError('Email address is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      // TODO: replace with real API — POST /auth/forgot-password
      await new Promise((r) => setTimeout(r, 1200));
      onNext(email.trim());
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {apiError && (
        <Alert variant="destructive">
          <IconAlertCircle className="size-4" stroke={2} />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="font-medium text-foreground">
          Email Address
        </Label>
        <div className="relative">
          <IconMail
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            stroke={1.75}
          />
          <Input
            id="email"
            type="email"
            placeholder="you@restaurant.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            aria-invalid={!!error}
            className="pl-8"
            autoComplete="email"
            autoFocus
          />
        </div>
        {error && (
          <p className="flex items-center gap-1 text-[11px] text-destructive">
            <IconAlertCircle className="size-3 shrink-0" stroke={2} />
            {error}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <><IconLoader2 className="size-4 animate-spin" stroke={2} />Sending Code…</>
        ) : (
          <>Send Verification Code<IconArrowRight className="size-4" /></>
        )}
      </Button>

      <div className="flex items-center justify-center">
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-3" stroke={2} />
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

// ─── Step 2: OTP Verification ─────────────────────────────────────────────────
function OtpStep({
  email,
  onBack,
  onSuccess,
}: {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const { seconds, start } = useCountdown(RESEND_COOLDOWN);

  useEffect(() => { start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleVerify() {
    if (otp.length < OTP_LENGTH) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      // TODO: replace with real API — POST /auth/verify-reset-otp
      await new Promise((r) => setTimeout(r, 1000));
      if (otp === '000000') throw new Error('Invalid verification code. Please try again.');
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    // TODO: replace with real API — POST /auth/forgot-password (resend)
    await new Promise((r) => setTimeout(r, 800));
    setResending(false);
    setOtp('');
    start();
  }

  function handleOtpChange(val: string) {
    setOtp(val);
    setError('');
    if (val.length === OTP_LENGTH) setTimeout(handleVerify, 300);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <IconMailCheck className="size-6 text-primary" stroke={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Check your email</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            We sent a 6-digit reset code to{' '}
            <span className="font-medium text-foreground">{maskEmail(email)}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Label className="self-start font-medium text-foreground">Verification Code</Label>
        <InputOTP
          maxLength={OTP_LENGTH}
          value={otp}
          onChange={handleOtpChange}
          disabled={loading}
        >
          <InputOTPGroup>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <InputOTPSlot key={i} index={i} className="size-11 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && (
          <p className="flex items-center gap-1 text-[11px] text-destructive">
            <IconAlertCircle className="size-3 shrink-0" stroke={2} />
            {error}
          </p>
        )}
      </div>

      <Button
        onClick={handleVerify}
        className="w-full gap-2"
        disabled={loading || otp.length < OTP_LENGTH}
      >
        {loading ? (
          <><IconLoader2 className="size-4 animate-spin" stroke={2} />Verifying…</>
        ) : (
          <>Verify Code<IconArrowRight className="size-4" /></>
        )}
      </Button>

      <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        <span>Didn't receive the code?</span>
        {seconds > 0 ? (
          <span className="font-medium text-foreground">Resend in {seconds}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className={cn(
              'flex items-center gap-1 font-medium text-primary hover:underline',
              resending && 'opacity-60'
            )}
          >
            {resending
              ? <IconLoader2 className="size-3 animate-spin" stroke={2} />
              : <IconRefresh className="size-3" stroke={2} />}
            Resend code
          </button>
        )}
      </div>

      <Separator />
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-3" stroke={2} />
        Use a different email
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');

  function handleEmailNext(submittedEmail: string) {
    setEmail(submittedEmail);
    setStep('verify-otp');
  }

  function handleOtpSuccess() {
    // Pass verified email via state so ResetPassword page can use it
    navigate('/reset-password', { state: { email, verified: true } });
  }

  const meta = {
    email: { title: 'Forgot password?', description: 'Enter your email and we\'ll send a reset code.' },
    'verify-otp': { title: 'Verify your email', description: 'Enter the code we sent to confirm it\'s you.' },
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
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
              <IconFlame className="size-5 text-primary-foreground" stroke={2} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Restro<span className="text-primary">Partner</span>
            </span>
          </Link>
        </div>

        <Card className="shadow-xl shadow-black/5">
          <CardHeader className="pb-5">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-bold">{meta[step].title}</CardTitle>
                <CardDescription className="mt-1 text-xs">{meta[step].description}</CardDescription>
              </div>
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                <div className={cn('h-1.5 w-6 rounded-full transition-all', step === 'email' ? 'bg-primary' : 'bg-primary/30')} />
                <div className={cn('h-1.5 w-6 rounded-full transition-all', step === 'verify-otp' ? 'bg-primary' : 'bg-muted')} />
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            {step === 'email' && <EmailStep onNext={handleEmailNext} />}
            {step === 'verify-otp' && (
              <OtpStep
                email={email}
                onBack={() => setStep('email')}
                onSuccess={handleOtpSuccess}
              />
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Step {step === 'email' ? '1' : '2'} of 2 —{' '}
          {step === 'email' ? 'Enter email' : 'Verify code'}
        </p>

        {/* Security note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <IconShieldCheck className="size-3.5 text-primary/60" stroke={1.75} />
          Reset codes expire in 10 minutes for your security.
        </div>
      </div>
    </div>
  );
}
