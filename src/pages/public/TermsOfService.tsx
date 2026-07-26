import { Link } from "react-router-dom"
import {
  IconArrowLeft,
  IconMail,
  IconGlobe,
  IconGavel,
  IconShieldCheck,
  IconUser,
  IconDeviceMobile,
  IconCreditCard,
  IconBrain,
  IconMapPin,
  IconCloudUpload,
  IconBuildingStore,
  IconLock,
  IconAlertTriangle,
  IconRefresh,
  IconScale,
  IconInfoCircle,
} from "@tabler/icons-react"
import { BrandLogo } from "@/components/BrandLogo"
import { APP_NAME_LEGAL } from "@/utils/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// ─── Section Component ────────────────────────────────────────────────────────
function Section({
  number,
  title,
  icon: Icon,
  children,
}: {
  number: number
  title: string
  icon: React.ComponentType<{ className?: string; stroke?: number }>
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {number}
        </span>
        <Icon className="size-5 text-primary" stroke={1.75} />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <div className="pl-11 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

// ─── Bullet List ──────────────────────────────────────────────────────────────
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TermsOfService() {
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
            <IconGavel className="mr-1.5 size-3" />
            Legal
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last Updated: January 2026
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Intro */}
        <div className="mb-10 text-sm leading-relaxed text-muted-foreground">
          <p>
            These Terms of Service ("Terms") govern your access to and use of {APP_NAME_LEGAL},
            including our mobile applications, desktop applications, website, and related services
            (collectively, the "Service"). By installing, accessing, or using {APP_NAME_LEGAL},
            you agree to be bound by these Terms.
          </p>
          <Card className="mt-4 border-amber-500/20 bg-amber-500/5 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                If you do not agree with these Terms, you must not use the Service.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        <Section number={1} title={`About ${APP_NAME_LEGAL}`} icon={IconBuildingStore}>
          <p>
            {APP_NAME_LEGAL} is a billing and business management software that helps
            businesses create invoices, manage products, track sales, and perform related
            accounting activities. The Service may work in offline and online modes, with
            automatic synchronization when internet connectivity is available.
          </p>
        </Section>

        <Section number={2} title="Eligibility" icon={IconUser}>
          <BulletList
            items={[
              "You must be at least 18 years old to use the Service.",
              "You represent that you are legally permitted to run a business or act on behalf of a business.",
              `If you are using ${APP_NAME_LEGAL} on behalf of an organization, you confirm that you have the authority to bind that organization to these Terms.`,
            ]}
          />
        </Section>

        <Section number={3} title="User Account & Responsibility" icon={IconShieldCheck}>
          <BulletList
            items={[
              "You are responsible for maintaining the confidentiality of your login credentials.",
              "You are fully responsible for all activities performed through your account.",
              "You agree to provide accurate and up-to-date business information.",
              `${APP_NAME_LEGAL} is not responsible for unauthorized access caused by your failure to secure your device or account.`,
            ]}
          />
        </Section>

        <Section number={4} title="Use of the Service" icon={IconDeviceMobile}>
          <p>
            You agree to use {APP_NAME_LEGAL} only for lawful business purposes.
          </p>
          <p className="mt-3 font-semibold text-foreground">You must NOT:</p>
          <BulletList
            items={[
              "Use the Service for illegal or fraudulent activities",
              "Attempt to hack, reverse engineer, or misuse the application",
              "Upload false, misleading, or unlawful data",
              "Interfere with the normal functioning of the Service",
            ]}
          />
          <p className="mt-3 text-xs italic">
            We reserve the right to suspend or terminate accounts that violate these Terms.
          </p>
        </Section>

        <Section number={5} title="Billing, Invoices & Data Accuracy" icon={IconCreditCard}>
          <BulletList
            items={[
              `${APP_NAME_LEGAL} provides tools to generate invoices, bills, reports, and business records.`,
              "You are solely responsible for verifying the accuracy of invoices, taxes, GST details, pricing, and customer data before sharing or filing.",
              "The Service does not replace professional accounting, tax, or legal advice.",
              "Final responsibility for compliance with GST laws, tax filings, and government regulations lies with you, the business owner.",
            ]}
          />
        </Section>

        <Section number={6} title="AI & Voice-Based Features" icon={IconBrain}>
          <p>
            {APP_NAME_LEGAL} may offer AI-powered features such as:
          </p>
          <BulletList
            items={[
              "Voice-based billing",
              "Invoice suggestions",
              "Data recognition or automation",
            ]}
          />
          <p className="mt-4 font-semibold text-foreground">You understand and agree that:</p>
          <BulletList
            items={[
              "AI-generated outputs may contain errors",
              "AI features are assistive only, not authoritative",
              "You must manually review and confirm all AI-generated data",
              `${APP_NAME_LEGAL} is not liable for losses caused by incorrect AI interpretations.`,
            ]}
          />
        </Section>

        <Section number={7} title="Geolocation & Store Listing" icon={IconMapPin}>
          <p>
            We collect your geolocation data (latitude and longitude) to provide location-based services.
          </p>
          <BulletList
            items={[
              `By using the Service, you agree that we may use your location to list your store on our ${APP_NAME_LEGAL} maps and business directories.`,
              `This feature is intended to help enhance the visibility of your business within the ${APP_NAME_LEGAL} ecosystem.`,
            ]}
          />
        </Section>

        <Section number={8} title="Offline Usage & Data Sync" icon={IconCloudUpload}>
          <BulletList
            items={[
              `${APP_NAME_LEGAL} supports offline usage with local data storage.`,
              "Data synchronization occurs automatically when internet connectivity is available.",
              "Sync conflicts, delays, or failures may occur due to network issues, device limitations, or third-party services.",
            ]}
          />
          <p className="mt-3 font-semibold text-foreground">You acknowledge that:</p>
          <BulletList
            items={[
              "You are responsible for maintaining backups",
              "Data loss due to device damage, OS failure, or improper usage is not our liability",
            ]}
          />
        </Section>

        <Section number={9} title="Subscription, Payments & Refunds" icon={IconCreditCard}>
          <BulletList
            items={[
              "Some features may require a paid subscription.",
              "Subscription fees are displayed clearly before purchase.",
              "Payments are processed via third-party payment providers.",
            ]}
          />
          <p className="mt-4 font-semibold text-foreground">Refund Policy</p>
          <BulletList
            items={[
              "Subscription fees are non-refundable once the service has been accessed or used, unless required by law.",
              "Free trials may be withdrawn or modified at our discretion.",
            ]}
          />
        </Section>

        <Section number={10} title="Third-Party Services" icon={IconGlobe}>
          <p>
            {APP_NAME_LEGAL} may integrate with third-party services such as:
          </p>
          <BulletList
            items={[
              "Payment gateways",
              "Cloud storage providers",
              "Analytics tools",
            ]}
          />
          <p className="mt-3 text-xs italic">
            We are not responsible for issues caused by third-party services beyond our control.
          </p>
        </Section>

        <Section number={11} title="Intellectual Property" icon={IconLock}>
          <BulletList
            items={[
              `${APP_NAME_LEGAL}, including its software, logo, design, and content, is our intellectual property.`,
              "You are granted a limited, non-exclusive, non-transferable license to use the Service.",
              "You may not copy, modify, distribute, or resell the Service without written permission.",
            ]}
          />
        </Section>

        <Section number={12} title="Limitation of Liability" icon={IconAlertTriangle}>
          <p>To the maximum extent permitted by law:</p>
          <BulletList
            items={[
              `${APP_NAME_LEGAL} is provided on an "as-is" and "as-available" basis`,
              "We are not liable for indirect, incidental, or consequential damages",
              "We are not responsible for business losses, loss of profit, data loss, or tax penalties",
              "Your use of the Service is entirely at your own risk.",
            ]}
          />
        </Section>

        <Section number={13} title="Termination" icon={IconAlertTriangle}>
          <p>We may suspend or terminate your access to {APP_NAME_LEGAL}:</p>
          <BulletList
            items={[
              "If you violate these Terms",
              "If required by law",
              "To protect the integrity of the Service",
            ]}
          />
          <p className="mt-3 text-xs italic">
            Upon termination, your right to use the Service will immediately cease.
          </p>
        </Section>

        <Section number={14} title="Changes to These Terms" icon={IconRefresh}>
          <p>We may update these Terms from time to time.</p>
          <BulletList
            items={[
              "Updated Terms will be posted within the app or on our website",
              "Continued use of the Service constitutes acceptance of the updated Terms",
            ]}
          />
        </Section>

        <Section number={15} title="Governing Law" icon={IconScale}>
          <p>
            These Terms shall be governed by and interpreted in accordance with the laws of India.
          </p>
        </Section>

        <Section number={16} title="Contact Us" icon={IconMail}>
          <p className="font-semibold text-foreground">{APP_NAME_LEGAL} Support</p>
          <Card className="mt-3 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2.5">
                <IconMail className="size-4 text-primary" />
                <span className="text-sm text-foreground">Email:</span>
                <a
                  href="mailto:support@thesmartbills.com"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  support@thesmartbills.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <IconGlobe className="size-4 text-primary" />
                <span className="text-sm text-foreground">Website:</span>
                <a
                  href="https://www.thesmartbills.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  https://www.thesmartbills.com
                </a>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Agreement Banner */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5">
            <IconInfoCircle className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-primary/80">
              By using {APP_NAME_LEGAL}, you acknowledge that you have read, understood,
              and agreed to these Terms of Service.
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
