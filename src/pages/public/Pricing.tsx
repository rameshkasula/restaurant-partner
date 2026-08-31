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
  IconArrowRight,
  IconShield,
  IconHeadset,
  IconBrandSpeedtest,
  IconDeviceMobile,
  IconMail,
  IconBuildingStore,
  IconChevronDown,
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
        scrolled
          ? "border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
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
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? (
              <IconSun className="size-4" />
            ) : (
              <IconMoon className="size-4" />
            )}
          </button>
          <Link to={APP_PATHS.LOGIN}>
            <Button variant="ghost" size="sm" className="cursor-pointer">
              Sign In
            </Button>
          </Link>
          <Link to={APP_PATHS.REQUEST}>
            <Button size="sm" className="cursor-pointer gap-1.5">
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
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground"
          >
            {theme === "dark" ? (
              <IconSun className="size-4" />
            ) : (
              <IconMoon className="size-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-foreground"
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
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
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
            <Separator className="my-3 border-border/40" />
            <Link to={APP_PATHS.LOGIN} onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link
              to={APP_PATHS.REQUEST}
              onClick={() => setMobileOpen(false)}
              className="mt-2 block"
            >
              <Button className="w-full cursor-pointer gap-1.5">
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
    ctaHref: APP_PATHS.REQUEST,
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
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/20 to-background px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20 dark:opacity-10"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <Badge
          variant="outline"
          className="mb-5 gap-1.5 border-primary/20 bg-background/50 px-3.5 py-1.5 text-xs font-semibold text-primary"
        >
          <IconSparkles className="size-3.5 animate-pulse text-primary" />
          Simple & Transparent Pricing
        </Badge>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Plans That{" "}
          <span className="bg-gradient-to-r from-primary via-rose-500 to-orange-500 bg-clip-text text-transparent">
            Grow With You
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Start with a 14-day free trial. No credit card required. Switch plans
          anytime.
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/50 p-1 shadow-sm backdrop-blur-xs">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
              !isYearly
                ? "bg-background font-bold text-foreground shadow-xs ring-1 ring-border/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200",
              isYearly
                ? "bg-background font-bold text-foreground shadow-xs ring-1 ring-border/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary dark:bg-primary/25">
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
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-stretch gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          return (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col justify-between overflow-visible border border-border/80 bg-card/75 backdrop-blur-xs transition-all duration-300 hover:-translate-y-2",
                plan.highlighted
                  ? "z-10 scale-105 border-transparent shadow-2xl ring-2 shadow-primary/15 ring-primary"
                  : "hover:border-border-foreground/30 hover:shadow-xl hover:shadow-border/40"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
                  <Badge className="gap-1.5 border-none bg-primary px-4.5 py-1 text-xs font-black tracking-wider text-primary-foreground uppercase shadow-lg shadow-primary/30">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div>
                <CardHeader className="pt-8 pb-5">
                  <span
                    className={cn(
                      "text-xs font-bold tracking-wider uppercase",
                      plan.highlighted
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {plan.name}
                  </span>
                  <CardTitle className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-2 min-h-[40px] text-sm leading-relaxed">
                    {plan.tagline}
                  </CardDescription>

                  {/* Price */}
                  <div className="mt-5 flex flex-col gap-1">
                    <div className="flex items-baseline gap-1.5">
                      {price !== null ? (
                        <>
                          <span className="text-5xl font-black tracking-tight text-foreground">
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            /mo
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl font-extrabold text-foreground">
                          {plan.priceLabel}
                        </span>
                      )}
                    </div>

                    {/* Yearly savings callout */}
                    {isYearly && plan.monthlyPrice && plan.yearlyPrice && (
                      <div className="mt-1 flex flex-col">
                        <span className="text-[11px] text-muted-foreground">
                          Billed annually (₹
                          {(plan.yearlyPrice * 12).toLocaleString("en-IN")}/yr)
                        </span>
                        <span className="mt-0.5 text-[11px] font-semibold text-emerald-500">
                          Save ₹
                          {(
                            (plan.monthlyPrice - plan.yearlyPrice) *
                            12
                          ).toLocaleString("en-IN")}{" "}
                          per year
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <Separator className="mx-6 border-border/40" />

                <CardContent className="py-6">
                  <ul className="flex flex-col gap-3.5">
                    {plan.features.map(({ text, included }) => (
                      <li key={text} className="flex items-start gap-3">
                        {included ? (
                          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
                            <IconCheck className="size-3.5" stroke={3} />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground/30 opacity-40">
                            <IconX className="size-3" stroke={2} />
                          </div>
                        )}
                        <span
                          className={cn(
                            "text-sm leading-tight",
                            included
                              ? "font-medium text-foreground"
                              : "text-muted-foreground/40 line-through decoration-muted-foreground/20"
                          )}
                        >
                          {text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              <CardFooter className="pt-4 pb-8">
                <Link to={plan.ctaHref} className="w-full">
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className={cn(
                      "h-11 w-full cursor-pointer gap-1.5 text-sm font-bold transition-all duration-300",
                      plan.highlighted
                        ? "border-none bg-gradient-to-r from-primary to-rose-600 text-white shadow-lg shadow-primary/20 hover:from-primary/90 hover:to-rose-600/90"
                        : "hover:border-foreground/30 hover:bg-muted"
                    )}
                  >
                    {plan.name === "Enterprise" ? (
                      <IconMail className="size-4" />
                    ) : (
                      <IconRocket className="size-4" />
                    )}
                    {plan.cta}
                    <IconArrowRight className="size-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <p className="mx-auto mt-12 max-w-md rounded-full border border-border/40 bg-muted/30 px-4 py-2.5 text-center text-xs text-muted-foreground">
        All plans include a 14-day free trial · Cancel anytime · No setup fees ·
        Prices in INR + GST
      </p>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════════════════

const COMPARISON_ROWS: {
  feature: string
  starter: boolean | string
  pro: boolean | string
  enterprise: boolean | string
}[] = [
  {
    feature: "Number of outlets",
    starter: "1",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "Menu items",
    starter: "Up to 50",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "Live order tracking",
    starter: true,
    pro: true,
    enterprise: true,
  },
  { feature: "Basic analytics", starter: true, pro: true, enterprise: true },
  {
    feature: "Advanced analytics",
    starter: false,
    pro: true,
    enterprise: true,
  },
  { feature: "Staff management", starter: false, pro: true, enterprise: true },
  { feature: "Online ordering", starter: false, pro: true, enterprise: true },
  { feature: "Payment gateway", starter: false, pro: true, enterprise: true },
  { feature: "Custom branding", starter: false, pro: true, enterprise: true },
  {
    feature: "White-label solution",
    starter: false,
    pro: false,
    enterprise: true,
  },
  {
    feature: "Dedicated manager",
    starter: false,
    pro: false,
    enterprise: true,
  },
  {
    feature: "ERP / POS integrations",
    starter: false,
    pro: false,
    enterprise: true,
  },
  {
    feature: "SLA uptime guarantee",
    starter: false,
    pro: false,
    enterprise: true,
  },
  { feature: "On-site training", starter: false, pro: false, enterprise: true },
  {
    feature: "Support",
    starter: "Email 48h",
    pro: "24/7 chat",
    enterprise: "Dedicated",
  },
]

function renderCell(value: boolean | string) {
  if (typeof value === "string") {
    return (
      <span className="text-sm font-semibold text-foreground">{value}</span>
    )
  }
  return value ? (
    <div className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
      <IconCheck className="size-4" stroke={3} />
    </div>
  ) : (
    <div className="inline-flex size-6 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/20">
      <IconX className="size-3.5" stroke={1.5} />
    </div>
  )
}

function ComparisonTable() {
  return (
    <section className="relative overflow-hidden bg-muted/10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_120%,rgba(199,0,54,0.04),transparent)]" />
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/20 bg-background/50 text-primary"
          >
            Full Feature Breakdown
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            See What's Included
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            A side-by-side breakdown of every feature across all plans.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-xl backdrop-blur-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="px-6 py-5 text-left text-sm font-bold tracking-wide text-foreground">
                    Feature
                  </th>
                  <th className="w-[180px] px-6 py-5 text-center text-sm font-bold tracking-wide text-foreground">
                    Starter
                  </th>
                  <th className="relative w-[180px] border-x border-primary/10 bg-primary/3 px-6 py-5 text-center text-sm font-bold tracking-wide text-primary dark:bg-primary/5">
                    Pro
                    <span className="absolute -top-1 right-2 rounded-full bg-primary px-2 py-0.5 text-[8px] font-black tracking-widest text-primary-foreground uppercase shadow-xs">
                      POPULAR
                    </span>
                  </th>
                  <th className="w-[180px] px-6 py-5 text-center text-sm font-bold tracking-wide text-foreground">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {COMPARISON_ROWS.map(
                  ({ feature, starter, pro, enterprise }) => (
                    <tr
                      key={feature}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderCell(starter)}
                      </td>
                      <td className="border-x border-primary/10 bg-primary/3 px-6 py-4 text-center dark:bg-primary/5">
                        {renderCell(pro)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderCell(enterprise)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
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
    <div className="border-y border-border/40 bg-muted/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-3 text-center transition-transform duration-300 hover:scale-105 sm:flex-row sm:text-left"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs dark:bg-primary/25">
                <Icon className="size-5" stroke={2} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {label}
              </span>
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
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_25%,rgba(199,0,54,0.03),transparent)]" />
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/20 bg-background/50 text-primary"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Can't find your answer?{" "}
            <Link
              to={APP_PATHS.REQUEST}
              className="font-semibold text-primary transition-colors hover:text-rose-500 hover:underline"
            >
              Get in touch with us
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = openIdx === i
            return (
              <div
                key={i}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-xs transition-all duration-300",
                  isOpen
                    ? "border-primary/30 shadow-md ring-1 ring-primary/10"
                    : "hover:border-border-foreground/30 border-border/60 hover:shadow-xs"
                )}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200"
                >
                  <span className="text-base leading-snug font-bold text-foreground">
                    {q}
                  </span>
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300",
                      isOpen && "rotate-180 bg-primary/10 text-primary"
                    )}
                  >
                    <IconChevronDown className="size-4" />
                  </div>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "pointer-events-none grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border/40 bg-muted/10 px-6 py-5 text-sm leading-relaxed text-muted-foreground">
                      {a}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="relative overflow-hidden rounded-3xl border-none bg-[#120004] text-white shadow-2xl shadow-primary/5">
          {/* Accent light beams */}
          <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 size-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 -mb-16 -ml-16 size-80 rounded-full bg-orange-600/10 blur-3xl" />

          <CardContent className="relative z-10 flex flex-col items-center px-8 py-14 text-center sm:px-12">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
              <IconBuildingStore className="size-8 text-primary" stroke={1.5} />
            </div>

            <Badge
              variant="outline"
              className="mb-4 border-primary/30 bg-primary/5 px-3.5 py-1 text-xs font-bold tracking-widest text-primary uppercase"
            >
              Enterprise Solution
            </Badge>

            <h2 className="max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Running a large chain or franchise?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg">
              We design custom onboarding, multi-brand consolidation, offline
              POS integrations, and custom SLA-backed hosting for large-scale
              operators.
            </p>

            <div className="mt-8 flex w-full flex-wrap justify-center gap-4 sm:w-auto">
              <Link to={APP_PATHS.REQUEST} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full cursor-pointer gap-2 bg-white px-8 font-bold text-[#120004] shadow-lg hover:bg-neutral-100 sm:w-auto"
                >
                  <IconMail className="size-4" />
                  Contact Sales Team
                </Button>
              </Link>
              <Link to={APP_PATHS.REQUEST} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full cursor-pointer gap-2 border-white/20 px-8 font-bold text-white hover:bg-white/10 sm:w-auto"
                >
                  <IconRocket className="size-4" />
                  Start Free Trial
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
              {[
                "Custom onboarding & training",
                "SLA-backed support",
                "Dedicated staging sandbox",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5 font-medium">
                  <IconCheck
                    className="size-4 shrink-0 text-primary"
                    stroke={3}
                  />
                  {t}
                </span>
              ))}
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
    <footer className="border-t border-border bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to={APP_PATHS.HOME}>
            <BrandLogo />
          </Link>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link
              to={APP_PATHS.PRIVACY_POLICY}
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              to={APP_PATHS.TERMS_OF_SERVICE}
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              to={APP_PATHS.REQUEST}
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
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
