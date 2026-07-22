import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ── Shadcn components ───────────────────────────────────────────────────────
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';

// ── Tabler icons ────────────────────────────────────────────────────────────
import {
  IconChartBar,
  IconLivePhoto,
  IconReceipt,
  IconReportAnalytics,
  IconUsers,
  IconClipboardList,
  IconBook2,
  IconShoppingCart,
  IconMenu2,
  IconX,
  IconSun,
  IconMoon,
  IconArrowRight,
  IconStar,
  IconCheck,
  IconBrandSpeedtest,
  IconHeadset,
  IconBuildingStore,
  IconChevronRight,
  IconFlame,
  IconTrendingUp,
  IconShield,
  IconDeviceMobile,
  IconRocket,
  IconQuote,
  IconCircleCheckFilled,
} from '@tabler/icons-react';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════════════════

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Early Access', href: '#early-access' },
  { label: 'Pricing', href: '#pricing' },
];

function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled && 'border-b border-border bg-background/80 shadow-sm backdrop-blur-xl'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
            <IconFlame className="size-5 text-primary-foreground" stroke={2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Restro<span className="text-primary">Partner</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
          </button>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="gap-1.5">
              <IconRocket className="size-3.5" />
              Request Early Access
            </Button>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
          >
            {theme === 'dark' ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground"
          >
            {mobileOpen ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Separator className="my-3" />
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="mt-2 block">
              <Button className="w-full gap-1.5">
                <IconRocket className="size-3.5" />
                Request Early Access
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════

const BETA_AVATARS = ['AM', 'PR', 'RD', 'SK', 'NV'];

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'heroPulse 7s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -right-40 h-[400px] w-[400px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-chart-2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          {/* Launch badge */}
          <div className="mb-8 flex items-center justify-center">
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Now in Early Access — Join the Waitlist
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            The Smartest Way to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-chart-1))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Run Your Restaurant
            </span>
          </h1>

          {/* Sub */}
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            RestroPartner is an all-in-one management platform covering live orders, billing,
            analytics, staff, and your digital menu — so you can focus on great food, not
            spreadsheets.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="h-12 gap-2 px-8 text-sm">
                <IconRocket className="size-4" />
                Get Early Access — It's Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="h-12 gap-2 px-8 text-sm">
                See All Features
                <IconChevronRight className="size-4" />
              </Button>
            </a>
          </div>

          {/* Social proof — beta group */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <AvatarGroup>
              {BETA_AVATARS.map((initials) => (
                <Avatar key={initials} size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="text-xs">+</AvatarGroupCount>
            </AvatarGroup>
            <p className="text-xs text-muted-foreground">
              Join our growing beta community of restaurant owners & managers
            </p>
          </div>
        </div>

        {/* Feature preview card */}
        <div className="mx-auto mt-16 max-w-5xl">
          <Card className="overflow-hidden border-border/60 shadow-2xl shadow-primary/8">
            <CardContent className="p-0">
              {/* Fake dashboard chrome */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-chart-1/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs text-muted-foreground">Dashboard — RestroPartner</span>
              </div>
              {/* Mini dashboard grid */}
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {[
                  { label: "Today's Orders", value: '48', icon: IconClipboardList, up: true },
                  { label: 'Revenue Today', value: '₹18,240', icon: IconReceipt, up: true },
                  { label: 'Active Staff', value: '12', icon: IconUsers, up: false },
                  { label: 'Menu Items', value: '84', icon: IconBook2, up: false },
                ].map(({ label, value, icon: Icon, up }) => (
                  <Card key={label} size="sm">
                    <CardHeader className="pb-1">
                      <div className="flex items-center justify-between">
                        <CardDescription>{label}</CardDescription>
                        <Icon className="size-3.5 text-muted-foreground" stroke={1.5} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-bold text-foreground">{value}</p>
                      {up && (
                        <p className="flex items-center gap-1 text-[10px] text-primary">
                          <IconTrendingUp className="size-3" /> Live
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Order list preview */}
              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-xs font-medium text-foreground">Recent Orders</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: '#0041', item: 'Butter Chicken + Naan', status: 'Preparing', color: 'text-chart-1' },
                    { id: '#0040', item: 'Paneer Tikka Wrap', status: 'Ready', color: 'text-primary' },
                    { id: '#0039', item: 'Dosa Platter (2)', status: 'Delivered', color: 'text-muted-foreground' },
                  ].map(({ id, item, status, color }) => (
                    <div key={id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{id}</span>
                        <Separator orientation="vertical" />
                        <span className="text-xs text-foreground">{item}</span>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px]', color)}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes heroPulse {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, 0) scale(1.1); }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROOF BAR
// ═══════════════════════════════════════════════════════════════════════════

const PROOF_ITEMS = [
  { icon: IconBrandSpeedtest, label: '99.9% Uptime SLA' },
  { icon: IconShield, label: 'PCI-DSS Compliant' },
  { icon: IconHeadset, label: '24/7 Founder Support' },
  { icon: IconDeviceMobile, label: 'Works on Any Device' },
];

function ProofBar() {
  return (
    <div className="border-y border-border bg-muted/30 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {PROOF_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="size-4 text-primary" stroke={1.75} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: IconChartBar,
    title: 'Analytics Dashboard',
    description: 'Visualize sales, peak hours, top dishes, and KPIs with live charts.',
  },
  {
    icon: IconLivePhoto,
    title: 'Live Order Tracking',
    description: 'Real-time visibility across dine-in, takeout, and delivery orders.',
  },
  {
    icon: IconReceipt,
    title: 'Billing & Payments',
    description: 'Instant bill generation, multi-gateway payments, discounts & tips.',
  },
  {
    icon: IconReportAnalytics,
    title: 'Reporting Module',
    description: 'Export sales, inventory, and staff reports in CSV or PDF anytime.',
  },
  {
    icon: IconUsers,
    title: 'Staff Management',
    description: 'Roles, permissions, scheduling, and performance — all in one place.',
  },
  {
    icon: IconClipboardList,
    title: 'Order Management',
    description: 'Centralized hub to accept, modify, and dispatch every order.',
  },
  {
    icon: IconBook2,
    title: 'Digital Menu',
    description: 'Beautiful tablet menus with photos, specials, and dietary info.',
  },
  {
    icon: IconShoppingCart,
    title: 'Online Ordering',
    description: 'Let customers order online with live ETAs and order history.',
  },
];

function Features() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Everything You Need
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            One Platform.{' '}
            <span className="text-primary">Every Workflow.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            From the kitchen to the customer's table — digitized, streamlined, and built to scale.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:ring-primary/20"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-5 text-primary" stroke={1.75} />
                </div>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════════════

const STEPS = [
  {
    step: '01',
    icon: IconBuildingStore,
    title: 'Create Your Account',
    description: 'Sign up in under 2 minutes. Add your restaurant name, cuisine, and outlet details.',
  },
  {
    step: '02',
    icon: IconClipboardList,
    title: 'Configure & Customize',
    description: 'Upload your menu, set up your team roles, and connect your payment gateway.',
  },
  {
    step: '03',
    icon: IconTrendingUp,
    title: 'Grow With Data',
    description: 'Track live orders, read reports, and make decisions backed by real insights.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Simple Onboarding
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Up & Running in Minutes
          </h2>
          <p className="mt-4 text-muted-foreground">
            No IT team. No complex setup. Just sign up and start serving smarter.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ step, icon: Icon, title, description }) => (
            <Card key={step} className="relative overflow-visible text-center">
              <CardHeader className="items-center pb-2">
                <div className="relative mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="size-7 text-primary" stroke={1.5} />
                  <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-md">
                    {step}
                  </span>
                </div>
                <CardTitle className="text-base font-bold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EARLY ACCESS (replaces inflated testimonials for a startup)
// ═══════════════════════════════════════════════════════════════════════════

const BETA_VOICES = [
  {
    initials: 'AM',
    name: 'Arjun M.',
    role: 'Restaurant Owner, Bengaluru',
    quote: 'The order tracking and billing flow is exactly what I\'ve been looking for. So much cleaner than what I use now.',
  },
  {
    initials: 'PN',
    name: 'Priya N.',
    role: 'F&B Manager, Mumbai',
    quote: 'Being part of the beta has been great. The team actually listens — two of my feature requests are already live.',
  },
  {
    initials: 'RD',
    name: 'Rohan D.',
    role: 'Head Chef & Co-founder, Pune',
    quote: 'The digital menu builder is surprisingly easy. We had our full menu digitized in under an hour.',
  },
];

function EarlyAccess() {
  return (
    <section id="early-access" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Beta Community
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            What Early Users Are Saying
          </h2>
          <p className="mt-4 text-muted-foreground">
            We're building this with a small community of restaurant operators. Here's what they think.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {BETA_VOICES.map(({ initials, name, role, quote }) => (
            <Card key={name} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20">
              <CardHeader>
                <IconQuote className="size-6 text-primary/40" stroke={1.5} />
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-muted-foreground">"{quote}"</p>
              </CardContent>
              <CardFooter className="gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Stars row */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar key={i} className="size-5 fill-primary text-primary" stroke={1} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Loved by every beta participant so far — we're just getting started.
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════════════════

const PLANS = [
  {
    name: 'Starter',
    tagline: 'Perfect for single-outlet restaurants.',
    price: '₹1,999',
    period: '/month',
    features: [
      '1 outlet',
      'Live order tracking',
      'Digital menu (up to 50 items)',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    tagline: 'Built for multi-outlet & growing brands.',
    price: '₹4,999',
    period: '/month',
    features: [
      'Unlimited outlets',
      'Advanced analytics & exports',
      'Staff management & scheduling',
      'Online ordering system',
      'Payment gateway integration',
      'Priority 24/7 support',
    ],
    cta: 'Get Started Free',
    highlighted: true,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="bg-muted/20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Transparent Pricing
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Simple Plans, No Surprises
          </h2>
          <p className="mt-4 text-muted-foreground">
            14-day free trial on all plans. No credit card required to get started.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {PLANS.map(({ name, tagline, price, period, features, cta, highlighted }) => (
            <Card
              key={name}
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                highlighted && 'ring-2 ring-primary shadow-lg shadow-primary/10'
              )}
            >
              {highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="shadow-md shadow-primary/30 px-4 py-1 text-[11px] uppercase tracking-wider">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg font-bold">{name}</CardTitle>
                <CardDescription>{tagline}</CardDescription>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">{price}</span>
                  <span className="text-sm text-muted-foreground">{period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="flex flex-col gap-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                      <IconCircleCheckFilled className="size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/register" className="w-full">
                  <Button
                    variant={highlighted ? 'default' : 'outline'}
                    className="w-full gap-1.5"
                  >
                    {cta}
                    <IconArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          All plans include a 14-day free trial · Cancel anytime · No setup fees
        </p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA BANNER
// ═══════════════════════════════════════════════════════════════════════════

function CTABanner() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Card className="overflow-hidden ring-1 ring-primary/20">
          <CardContent className="relative overflow-hidden p-0">
            {/* Gradient bg */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)',
              }}
            />
            {/* Decorative blobs */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-20"
              style={{ background: 'var(--color-chart-1)', filter: 'blur(30px)' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full opacity-15"
              style={{ background: 'var(--color-primary-foreground)', filter: 'blur(20px)' }}
            />
            {/* Content */}
            <div className="relative px-8 py-14 text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to Run Your Restaurant Smarter?
              </h2>
              <p className="mt-4 text-base text-white/80">
                Join our early access program — free for the first 3 months, no credit card needed.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="h-12 gap-2 bg-white px-8 text-sm font-bold !text-primary hover:bg-white/90"
                  >
                    <IconRocket className="size-4" />
                    Get Early Access Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 px-8 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
                {['Free for 3 months', 'No credit card', 'Cancel anytime'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <IconCheck className="size-3.5" stroke={2.5} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

function Footer() {
  return (
    <footer className="border-t border-border px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                <IconFlame className="size-5 text-primary-foreground" stroke={2} />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Restro<span className="text-primary">Partner</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Building the management platform that modern Indian restaurants deserve.
            </p>
            <Badge variant="secondary" className="mt-3 text-xs">
              <span className="mr-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              Early Access Open
            </Badge>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mt-12 mb-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RestroPartner. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for India's restaurant industry
          </p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ProofBar />
        <Features />
        <HowItWorks />
        <EarlyAccess />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
