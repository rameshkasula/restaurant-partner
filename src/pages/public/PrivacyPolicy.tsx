import { Link } from "react-router-dom"
import {
  IconArrowLeft,
  IconMail,
  IconShieldCheck,
  IconTrash,
  IconLock,
  IconUserCheck,
  IconPhone,
} from "@tabler/icons-react"
import { BrandLogo } from "@/components/BrandLogo"
import { APP_NAME_LEGAL, SUPPORT_EMAIL } from "@/utils/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Ambient decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 opacity-15"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)",
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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: July 23, 2026
          </p>
        </div>

        <Separator className="mb-10" />

        {/* Introduction */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Introduction
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {APP_NAME_LEGAL} ("we," "our," or "us") is committed to protecting
            your privacy and handling your data with utmost care. This privacy
            policy explains how we collect, use, and protect your personal
            information.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-foreground">
            Information We Collect
          </h2>
          <h3 className="mb-4 text-base font-semibold text-foreground">
            Personal Information
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: IconUserCheck,
                title: "Name",
                desc: "For account identification and personalization",
              },
              {
                icon: IconMail,
                title: "Email address",
                desc: "For account verification and communication",
              },
              {
                icon: IconPhone,
                title: "Mobile number",
                desc: "For account verification and important updates",
              },
              {
                icon: IconShieldCheck,
                title: "Company details",
                desc: "For business profile management",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="shadow-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" stroke={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How We Use */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-foreground">
            How We Use Your Information
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-base font-semibold text-foreground">
                Primary Uses
              </h3>
              <ul className="space-y-2">
                {[
                  "Account management and verification",
                  "Providing customer support",
                  "Sending important updates",
                  "Improving our services",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-base font-semibold text-foreground">
                Data Protection
              </h3>
              <ul className="space-y-2">
                {[
                  "Encrypted data storage",
                  "Secure data transmission",
                  "Regular security audits",
                  "Limited access controls",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <IconLock className="size-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Data Deletion */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Data Deletion
          </h2>
          <Card className="shadow-sm ring-1 ring-destructive/10">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <IconTrash className="size-5 text-destructive" stroke={1.75} />
                <h3 className="text-base font-semibold text-foreground">
                  Account Deletion Process
                </h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                You have the right to request deletion of your account and
                associated data. To delete your account:
              </p>
              <ol className="mb-6 space-y-2 pl-4">
                {[
                  "Visit our Account Deletion Page",
                  "Enter your Company ID, Mobile Number, and Password",
                  "Submit the deletion request",
                ].map((step, i) => (
                  <li
                    key={step}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="text-sm text-muted-foreground">
                Upon successful verification, we will:
              </p>
              <ul className="mt-2 space-y-1.5 pl-4">
                {[
                  "Delete your personal information from our databases",
                  "Remove your company details and associated data",
                  "Send a confirmation email once the process is complete",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Data Security
          </h2>
          <h3 className="mb-3 text-base font-semibold text-foreground">
            Our Security Measures
          </h3>
          <ul className="space-y-2">
            {[
              "Industry-standard encryption for data storage and transmission",
              "Regular security assessments and updates",
              "Strict access controls and authentication",
              "Secure data backup procedures",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <IconShieldCheck className="size-3.5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Contact Us */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">Contact Us</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            If you have any questions about our privacy practices or need
            assistance with data deletion, please contact us at:
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
            </CardContent>
          </Card>
        </section>

        {/* Note */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs leading-relaxed text-primary/80">
              <strong className="text-primary">Note:</strong> This privacy
              policy may be updated periodically. We encourage you to review it
              regularly to stay informed about how we protect your information.
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
