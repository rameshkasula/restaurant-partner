import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  IconFlame,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconLoader2,
  IconAlertCircle,
  IconCircleCheck,
  IconShieldCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'form' | 'success';

interface FormState {
  password: string;
  confirm: string;
}

interface Errors {
  password?: string;
  confirm?: string;
}

// ─── Password strength meter ──────────────────────────────────────────────────
function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score === 2) return { score, label: 'Fair', color: 'bg-chart-1' };
  if (score === 3) return { score, label: 'Good', color: 'bg-primary' };
  return { score, label: 'Strong', color: 'bg-primary' };
}

function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${score <= 1 ? 'text-destructive' : score === 2 ? 'text-chart-1' : 'text-primary'}`}>
        {label} password
      </p>
    </div>
  );
}

// ─── Password field ────────────────────────────────────────────────────────────
function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = '••••••••',
  autoComplete,
  showStrength = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  showStrength?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <IconLock
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          stroke={1.75}
        />
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className="pl-8 pr-9"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show
            ? <IconEyeOff className="size-3.5" stroke={1.75} />
            : <IconEye className="size-3.5" stroke={1.75} />}
        </button>
      </div>
      {showStrength && <PasswordStrength password={value} />}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <IconAlertCircle className="size-3 shrink-0" stroke={2} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Requirements checklist ────────────────────────────────────────────────────
const REQUIREMENTS = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

function RequirementsList({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="flex flex-col gap-1">
      {REQUIREMENTS.map(({ test, label }) => {
        const met = test(password);
        return (
          <li key={label} className={`flex items-center gap-1.5 text-[11px] ${met ? 'text-primary' : 'text-muted-foreground'}`}>
            <IconCircleCheck className={`size-3 shrink-0 ${met ? 'text-primary' : 'text-muted'}`} stroke={2} />
            {label}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <IconCircleCheck className="size-9 text-primary" stroke={1.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Password Reset!</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
      </div>
      <Link to="/login" className="w-full">
        <Button className="w-full gap-2">
          Sign In Now
          <IconArrowRight className="size-4" />
        </Button>
      </Link>
      <Link
        to="/"
        className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Back to Home
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Guard: only allow if came from ForgotPassword OTP step
  const isVerified = (location.state as { verified?: boolean } | null)?.verified === true;

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<FormState>({ password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect away if not coming from verified forgot-password flow
  useEffect(() => {
    if (!isVerified) {
      navigate('/forgot-password', { replace: true });
    }
  }, [isVerified, navigate]);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.password) {
      e.password = 'New password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = 'Include at least one uppercase letter.';
    } else if (!/[0-9]/.test(form.password)) {
      e.password = 'Include at least one number.';
    }
    if (!form.confirm) {
      e.confirm = 'Please confirm your new password.';
    } else if (form.confirm !== form.password) {
      e.confirm = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      // TODO: replace with real API — POST /auth/reset-password
      // Pass email from location.state and the new password
      await new Promise((r) => setTimeout(r, 1200));
      setStep('success');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isVerified) return null; // Guard while redirecting

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
            <CardTitle className="text-lg font-bold">
              {step === 'form' ? 'Set new password' : 'Password updated'}
            </CardTitle>
            {step === 'form' && (
              <CardDescription className="text-xs">
                Choose a strong password for your account.
              </CardDescription>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            {step === 'success' ? (
              <SuccessScreen />
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {apiError && (
                  <Alert variant="destructive">
                    <IconAlertTriangle className="size-4" stroke={2} />
                    <AlertDescription>{apiError}</AlertDescription>
                  </Alert>
                )}

                <PasswordField
                  id="new-password"
                  label="New Password"
                  value={form.password}
                  onChange={(v) => {
                    setForm((p) => ({ ...p, password: v }));
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  error={errors.password}
                  autoComplete="new-password"
                  showStrength
                />

                {/* Requirements checklist — shown while typing */}
                <RequirementsList password={form.password} />

                <PasswordField
                  id="confirm-password"
                  label="Confirm New Password"
                  value={form.confirm}
                  onChange={(v) => {
                    setForm((p) => ({ ...p, confirm: v }));
                    if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
                  }}
                  error={errors.confirm}
                  autoComplete="new-password"
                />

                {/* Match indicator */}
                {form.confirm && form.password && (
                  <p className={`-mt-1 flex items-center gap-1 text-[11px] font-medium ${
                    form.confirm === form.password ? 'text-primary' : 'text-destructive'
                  }`}>
                    <IconCircleCheck className="size-3 shrink-0" stroke={2} />
                    {form.confirm === form.password ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}

                <Button
                  type="submit"
                  className="mt-2 w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><IconLoader2 className="size-4 animate-spin" stroke={2} />Updating Password…</>
                  ) : (
                    <>Reset Password<IconArrowRight className="size-4" /></>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <IconShieldCheck className="size-3.5 text-primary/60" stroke={1.75} />
                  Your password is encrypted and stored securely.
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {step === 'form' && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
