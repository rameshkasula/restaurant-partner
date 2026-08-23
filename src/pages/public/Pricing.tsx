import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  IconCheck,
  IconX,
  IconMenu2,
  IconSun,
  IconMoon,
  IconRocket,
  IconCircleCheckFilled,
  IconArrowRight,
  IconShield,
  IconHeadset,
  IconBrandSpeedtest,
  IconDeviceMobile,
  IconMail,
  IconBuildingStore,
  IconStar,
  IconChevronDown,
  IconChevronUp,
  IconSparkles,
} from "@tabler/icons-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { APP_PATHS } from "@/router/paths"
import { APP_NAME } from "@/utils/constants"
import { BrandLogo } from "@/components/BrandLogo"

// ═══════════════════════════════════════════════════════════════════════════
// NAVBAR (shared)
// ═══════════════════════════════════════════════════════════════════════════

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Early Access", href: "/#early-access" },
  { label: "Pricing", href: APP_PATHS.PRICING },
]

function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled &&
          "border-b border-border bg-background/80 shadow-sm backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to={APP_PATHS.HOME}>
          <BrandLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                link.label === "Pricing"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? (
              <IconSun className="size-4" />
            ) : (
              <IconMoon className="size-4" />
            )}
          </button>
          <Link to={APP_PATHS.LOGIN}>
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to={APP_PATHS.REQUEST}>
            <Button size="sm" className="gap-1.5">
              <IconRocket className="size-3.5" />
              Get Early Access
            </Button>
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
          >
            {theme === "dark" ? (
              <IconSun className="size-4" />
            ) : (
              <IconMoon className="size-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground"
          >
            {mobileOpen ? (
              <IconX className="size-5" />
            ) : (
              <IconMenu2 className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Separator className="my-3" />
            <Link to={APP_PATHS.LOGIN} onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link
              to={APP_PATHS.REQUEST}
              onClick={() => setMobileOpen(false)}
              className="mt-2 block"
            >
              <Button className="w-full gap-1.5">
                <IconRocket className="size-3.5" />
                Get Early Access
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN DATA
// ═══════════════════════════════════════════════════════════════════════════

interface Plan {
  name: string
  tagline: string
  monthlyPrice: number | null
  yearlyPrice: number | null
  priceLabel?: string
  badge?: string
  highlighted: boolean
  features: { text: string; included: boolean }[]
  cta: string
  ctaHref: string
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    tagline: "Perfect for single-outlet restaurants just getting started.",
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    highlighted: false,
    cta: "Start Free Trial",
    ctaHref: APP_PATHS.REQUEST,
    features: [
      { text: "1 outlet", included: true },
      { text: "Live order tracking", included: true },
      { text: "Digital menu (up to 50 items)", included: true },
      { text: "Basic analytics dashboard", included: true },
      { text: "Email support (48h response)", included: true },
      { text: "Staff management", included: false },
      { text: "Advanced analytics & exports", included: false },
      { text: "Online ordering system", included: false },
      { text: "Payment gateway integration", included: false },
      { text: "Priority 24/7 support", included: false },
    ],
  },
  {
    name: "Pro",
    tagline: "Built for growing brands and multi-outlet operations.",
    monthlyPrice: 4999,
    yearlyPrice: 3999,
    badge: "Most Popular",
    highlighted: true,
    cta: "Get Started Free",
    ctaHref: APP_PATHS.REQUEST,
    features: [
      { text: "Unlimited outlets", included: true },
      { text: "Live order tracking", included: true },
      { text: "Digital menu (unlimited items)", included: true },
      { text: "Advanced analytics & exports", included: true },
      { text: "Staff management & scheduling", included: true },
      { text: "Online ordering system", included: true },
      { text: "Payment gateway integration", included: true },
      { text: "Priority 24/7 support", included: true },
      { text: "Custom branding on menus", included: true },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Enterprise",
    tagline: "Tailored for large chains, franchises & cloud kitchens.",
    monthlyPrice: null,
    yearlyPrice: null,
    priceLabel: "Custom",
    highlighted: false,
    cta: "Contact Us",
    ctaHref: "mailto:hello@bistrohub.in",
    features: [
      { text: "Unlimited outlets", included: true },
      { text: "All Pro features included", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "White-label solution", included: true },
      { text: "Custom integrations (ERP, POS)", included: true },
      { text: "SLA-backed uptime guarantee", included: true },
      { text: "On-site onboarding & training", included: true },
      { text: "Custom analytics & reporting", included: true },
      { text: "Priority 24/7 support", included: true },
      { text: "Volume-based pricing", included: true },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════

function PricingHero({
  isYearly,
  setIsYearly,
}: {
  isYearly: boolean
  setIsYearly: (v: boolean) => void
}) {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mb-5 gap-1.5 px-3 py-1 text-xs font-semibold">
          <IconSparkles className="size-3 text-primary" />
          Simple & Transparent Pricing
        </Badge>

        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Plans That{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-chart-1))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Grow With You
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Start with a 14-day free trial. No credit card required. Switch plans anytime.
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-muted/50 p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200",
              !isYearly
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200",
              isYearly
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              Save 20%
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN CARDS
// ═══════════════════════════════════════════════════════════════════════════

function PlanCards({ isYearly }: { isYearly: boolean }) {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          return (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col transition-all duration-300 hover:-translate-y-1",
                plan.highlighted
                  ? "shadow-2xl shadow-primary/15 ring-2 ring-primary"
                  : "hover:shadow-lg hover:shadow-border/30"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 px-4 py-1 text-[11px] tracking-wider uppercase shadow-md shadow-primary/30">
                    <IconStar className="size-3 fill-current" stroke={0} />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{plan.tagline}</CardDescription>

                {/* Price */}
                <div className="mt-5 flex items-baseline gap-1">
                  {price !== null ? (
                    <>
                      <span className="text-5xl font-extrabold tracking-tight text-foreground">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">/mo</span>
                        {isYearly && (
                          <span className="text-[10px] text-primary font-semibold">billed yearly</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-4xl font-extrabold text-foreground">
                      {plan.priceLabel}
                    </span>
                  )}
                </div>

                {/* Yearly savings callout */}
                {isYearly && plan.monthlyPrice && plan.yearlyPrice && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Save{" "}
                    <span className="font-semibold text-primary">
                      ₹{((plan.monthlyPrice - plan.yearlyPrice) * 12).toLocaleString("en-IN")}
                    </span>{" "}
                    per year vs monthly
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 pb-6">
                <ul className="flex flex-col gap-3">
                  {plan.features.map(({ text, included }) => (
                    <li key={text} className="flex items-start gap-2.5">
                      {included ? (
                        <IconCircleCheckFilled className="mt-0.5 size-4 shrink-0 text-primary" />
                      ) : (
                        <IconX className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          included ? "text-foreground" : "text-muted-foreground/50"
                        )}
                      >
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link
                  to={plan.ctaHref}
                  className="w-full"
                >
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className={cn("w-full gap-1.5", plan.highlighted && "shadow-lg shadow-primary/20")}
                  >
                    {plan.name === "Enterprise" ? (
                      <IconMail className="size-3.5" />
                    ) : (
                      <IconRocket className="size-3.5" />
                    )}
                    {plan.cta}
                    <IconArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        All plans include a 14-day free trial · Cancel anytime · No setup fees · Prices in INR + GST
      </p>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════════════════

const COMPARISON_ROWS: { feature: string; starter: boolean | string; pro: boolean | string; enterprise: boolean | string }[] = [
  { feature: "Number of outlets",      starter: "1",          pro: "Unlimited",   enterprise: "Unlimited" },
  { feature: "Menu items",             starter: "Up to 50",   pro: "Unlimited",   enterprise: "Unlimited" },
  { feature: "Live order tracking",    starter: true,         pro: true,          enterprise: true },
  { feature: "Basic analytics",        starter: true,         pro: true,          enterprise: true },
  { feature: "Advanced analytics",     starter: false,        pro: true,          enterprise: true },
  { feature: "Staff management",       starter: false,        pro: true,          enterprise: true },
  { feature: "Online ordering",        starter: false,        pro: true,          enterprise: true },
  { feature: "Payment gateway",        starter: false,        pro: true,          enterprise: true },
  { feature: "Custom branding",        starter: false,        pro: true,          enterprise: true },
  { feature: "White-label solution",   starter: false,        pro: false,         enterprise: true },
  { feature: "Dedicated manager",      starter: false,        pro: false,         enterprise: true },
  { feature: "ERP / POS integrations", starter: false,        pro: false,         enterprise: true },
  { feature: "SLA uptime guarantee",   starter: false,        pro: false,         enterprise: true },
  { feature: "On-site training",       starter: false,        pro: false,         enterprise: true },
  { feature: "Support",                starter: "Email 48h",  pro: "24/7 chat",   enterprise: "Dedicated" },
]

function renderCell(value: boolean | string) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-foreground">{value}</span>
  }
  return value ? (
    <IconCheck className="mx-auto size-4 text-primary" stroke={2.5} />
  ) : (
    <IconX className="mx-auto size-4 text-muted-foreground/30" stroke={2} />
  )
}

function ComparisonTable() {
  return (
    <section className="bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="mb-4">Full Comparison</Badge>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            See What's Included
          </h2>
          <p className="mt-3 text-muted-foreground">
            A side-by-side breakdown of every feature across all plans.
          </p>
        </div>

        <div className="overflow-auto rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/50">
                <th className="px-5 py-4 text-left font-semibold text-foreground">Feature</th>
                <th className="px-5 py-4 text-center font-semibold text-foreground">Starter</th>
                <th className="relative px-5 py-4 text-center font-bold text-primary">
                  Pro
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                    POPULAR
                  </span>
                </th>
                <th className="px-5 py-4 text-center font-semibold text-foreground">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {COMPARISON_ROWS.map(({ feature, starter, pro, enterprise }, i) => (
                <tr
                  key={feature}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    i % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}
                >
                  <td className="px-5 py-3.5 text-sm text-foreground">{feature}</td>
                  <td className="px-5 py-3.5 text-center">{renderCell(starter)}</td>
                  <td className="bg-primary/3 px-5 py-3.5 text-center">{renderCell(pro)}</td>
                  <td className="px-5 py-3.5 text-center">{renderCell(enterprise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST BAR
// ═══════════════════════════════════════════════════════════════════════════

const TRUST_ITEMS = [
  { icon: IconBrandSpeedtest, label: "99.9% Uptime SLA" },
  { icon: IconShield, label: "PCI-DSS Compliant" },
  { icon: IconHeadset, label: "24/7 Founder Support" },
  { icon: IconDeviceMobile, label: "Works on Any Device" },
]

function TrustBar() {
  return (
    <div className="border-y border-border bg-muted/20 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="size-4 text-primary" stroke={1.75} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════════════════════════

const FAQS = [
  {
    q: "Is there really no credit card required for the free trial?",
    a: "Correct — you can start your 14-day trial with just an email address. We only ask for payment details when you decide to continue after the trial.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade at any time. When upgrading, we prorate the difference. When downgrading, the change takes effect at the end of your billing cycle.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "We'll notify you before any disruption. You won't be cut off suddenly — we'll work with you to find the right plan upgrade.",
  },
  {
    q: "Do you offer discounts for NGOs or cloud kitchens?",
    a: "Yes! We offer special pricing for NGOs, cloud kitchens, and early-stage startups. Reach out to us at hello@bistrohub.in and we'll set something up.",
  },
  {
    q: "How does yearly billing work?",
    a: "When you choose yearly billing, you're charged for 12 months upfront at a 20% discount. You get a full receipt and can cancel before renewal.",
  },
  {
    q: "What's included in 'Need to customize'?",
    a: "If none of the plans fit your exact needs — whether it's more outlets, a specific integration, white-labelling, or volume pricing — reach out to us directly. We build custom solutions for chains and franchises.",
  },
]

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Can't find your answer? Reach out at{" "}
            <a
              href="mailto:hello@bistrohub.in"
              className="font-medium text-primary hover:underline"
            >
              hello@bistrohub.in
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border/60 transition-all duration-200"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-foreground">{q}</span>
                {openIdx === i ? (
                  <IconChevronUp className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {openIdx === i && (
                <div className="border-t border-border/40 bg-muted/20 px-5 py-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMIZE CTA
// ═══════════════════════════════════════════════════════════════════════════

function CustomizeCTA() {
  return (
    <section className="bg-muted/20 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Card className="overflow-hidden ring-1 ring-primary/20">
          <CardContent className="relative overflow-hidden p-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-20"
              style={{ background: "var(--color-chart-1)", filter: "blur(30px)" }}
            />

            <div className="relative px-8 py-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <IconBuildingStore className="size-7 text-white" stroke={1.5} />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Need Something Custom?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-white/80">
                Running a chain, franchise, or cloud kitchen with unique requirements?
                We'll build a plan around your business — pricing included.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="mailto:hello@bistrohub.in">
                  <Button
                    size="lg"
                    className="h-11 gap-2 bg-white px-8 text-sm font-bold !text-primary hover:bg-white/90"
                  >
                    <IconMail className="size-4" />
                    Reach Out to Us
                  </Button>
                </a>
                <Link to={APP_PATHS.REQUEST}>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-11 gap-2 px-6 text-sm font-medium text-white hover:bg-white/10"
                  >
                    <IconRocket className="size-4" />
                    Start Free Trial
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
                {["No commitment required", "Response within 24h", "Custom integrations available"].map((t) => (
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
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER (minimal)
// ═══════════════════════════════════════════════════════════════════════════

function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to={APP_PATHS.HOME}>
            <BrandLogo />
          </Link>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to={APP_PATHS.PRIVACY_POLICY} className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to={APP_PATHS.TERMS_OF_SERVICE} className="hover:text-foreground transition-colors">Terms</Link>
            <a href="mailto:hello@bistrohub.in" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PricingHero isYearly={isYearly} setIsYearly={setIsYearly} />
        <PlanCards isYearly={isYearly} />
        <TrustBar />
        <ComparisonTable />
        <FAQ />
        <CustomizeCTA />
      </main>
      <Footer />
    </div>
  )
}
