import { useState } from "react"
import { Link } from "react-router-dom"
import {
  IconArrowLeft,
  IconShieldCheck,
  IconCookie,
  IconInfoCircle,
  IconSettings,
  IconEye,
  IconChartPie,
  IconMail,
  IconPhone,
  IconCheck,
} from "@tabler/icons-react"
import { BrandLogo } from "@/components/BrandLogo"
import { APP_NAME_LEGAL, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/utils/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function CookiePolicy() {
  // Simulated state for cookie categories
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    preferences: true,
    analytics: true,
    marketing: false,
  })

  const handleSavePreferences = () => {
    toast.success("Cookie preferences saved successfully!", {
      description: "Your settings will be applied to your current session.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 opacity-15"
        style={{
          background: "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)",
          filter: "blur(100px)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo />
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <IconArrowLeft className="size-3.5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Title Block */}
        <div className="mb-10">
          <Badge variant="secondary" className="mb-4 text-xs">
            <IconShieldCheck className="mr-1.5 size-3" />
            Legal
          </Badge>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconCookie className="size-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Cookie Policy
            </h1>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: July 23, 2026
          </p>
        </div>

        <Separator className="mb-10" />

        {/* Introduction */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">Introduction</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This Cookie Policy explains how {APP_NAME_LEGAL} ("we," "our," or "us") uses cookies and 
            similar tracking technologies when you visit our platform or use our services. By continuing 
            to browse our site, you consent to our use of cookies as described in this policy.
          </p>
        </section>

        {/* What are cookies */}
        <section className="mb-12">
          <div className="flex items-center gap-2.5 mb-4">
            <IconInfoCircle className="size-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">What Are Cookies?</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Cookies are small text files stored on your computer, tablet, or mobile device when you 
            visit a website. They allow the website to recognize your device and store information about 
            your preferences, past actions, and login status. Cookies help us provide you with a smoother, 
            more personalized experience.
          </p>
        </section>

        {/* Types of Cookies */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-foreground">Types of Cookies We Use</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: IconShieldCheck,
                title: "Essential Cookies",
                desc: "Required for security, user authentication, and critical platform features. These cannot be disabled.",
                status: "Always Active",
              },
              {
                icon: IconSettings,
                title: "Preference Cookies",
                desc: "Remember settings like your language preferences, theme choice, and display settings.",
                status: "Optional",
              },
              {
                icon: IconChartPie,
                title: "Analytics Cookies",
                desc: "Help us understand how visitors interact with our platform by collecting anonymous usage data.",
                status: "Optional",
              },
              {
                icon: IconEye,
                title: "Marketing Cookies",
                desc: "Used to deliver relevant advertisements and measure campaign effectiveness.",
                status: "Optional",
              },
            ].map(({ icon: Icon, title, desc, status }) => (
              <Card key={title} className="shadow-sm">
                <CardContent className="flex items-start gap-3.5 p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" stroke={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <Badge variant={status === "Always Active" ? "default" : "secondary"} className="text-[10px] py-0 px-1.5">
                        {status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Manage Preference Center */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">Cookie Preference Manager</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            You can customize your preferences for non-essential cookies. Toggle the switches below 
            and click "Save Preferences" to apply your choices.
          </p>
          <Card className="shadow-sm border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-5">
                {/* Essential */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Essential Cookies</p>
                    <p className="text-xs text-muted-foreground">Critical for core site functionality, billing systems, and session management.</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <Separator />

                {/* Preferences */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Preference Cookies</p>
                    <p className="text-xs text-muted-foreground">Used for remembering theme choices (dark/light mode) and custom settings.</p>
                  </div>
                  <Switch
                    checked={preferences.preferences}
                    onCheckedChange={(val) => setPreferences((p) => ({ ...p, preferences: val }))}
                  />
                </div>

                <Separator />

                {/* Analytics */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Analytics Cookies</p>
                    <p className="text-xs text-muted-foreground">Allows us to analyze page traffic and optimize user flows.</p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(val) => setPreferences((p) => ({ ...p, analytics: val }))}
                  />
                </div>

                <Separator />

                {/* Marketing */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Marketing & Advertising Cookies</p>
                    <p className="text-xs text-muted-foreground">Used to trace promotional campaigns and refer-a-friend credits.</p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(val) => setPreferences((p) => ({ ...p, marketing: val }))}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button size="sm" onClick={handleSavePreferences} className="gap-1.5">
                  <IconCheck className="size-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Us */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">Contact Us</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            If you have any questions about this Cookie Policy or how we handle your preferences, 
            please reach out to us at:
          </p>
          <Card className="shadow-sm">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2.5">
                <IconMail className="size-4 text-primary" />
                <span className="text-sm text-foreground">Email:</span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <IconPhone className="size-4 text-primary" />
                <span className="text-sm text-foreground">Phone:</span>
                <a
                  href={`tel:${SUPPORT_PHONE}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {SUPPORT_PHONE}
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Note */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs leading-relaxed text-primary/80">
              <strong className="text-primary">Note:</strong> We may update this Cookie Policy from time to 
              time to reflect changes in our practices or legal obligations. Please check back regularly.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 sm:px-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME_LEGAL}. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
