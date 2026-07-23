import { useState } from "react"
import { Link } from "react-router-dom"
import {
  IconArrowLeft,
  IconBriefcase,
  IconMapPin,
  IconClock,
  IconSend,
  IconHeartHandshake,
  IconDeviceLaptop,
  IconBook,
  IconCalendar,
  IconShield,
  IconRocket,
} from "@tabler/icons-react"
import { BrandLogo } from "@/components/BrandLogo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface JobListing {
  id: string
  title: string
  department: "Engineering" | "Sales & Success" | "Design & Product"
  location: string
  type: string
  description: string
  requirements: string[]
  responsibilities: string[]
}

const JOB_LISTINGS: JobListing[] = [
  {
    id: "frontend-engineer",
    title: "Senior Frontend Engineer (React/TypeScript)",
    department: "Engineering",
    location: "Bengaluru, India (Hybrid)",
    type: "Full-time",
    description: "We are looking for a Senior Frontend Engineer to lead the design and execution of our main web applications, building high-speed billing dashboards and restaurant portal tools.",
    requirements: [
      "4+ years of professional software engineering experience.",
      "Expert knowledge of React, TypeScript, and modern styling libraries (Tailwind CSS/Vanilla CSS).",
      "Experience with state management, client caching, and API integration workflows.",
      "Passion for premium visual UI design and smooth micro-animations."
    ],
    responsibilities: [
      "Own the architecture of front-end components and customer dashboards.",
      "Work closely with product designers to implement premium interfaces.",
      "Optimize web application performance for low-bandwidth scenarios in restaurant environments.",
      "Mentor junior developers and establish codebase patterns."
    ],
  },
  {
    id: "product-designer",
    title: "Product Designer",
    department: "Design & Product",
    location: "Bengaluru, India (Hybrid)",
    type: "Full-time",
    description: "Join us to shape the experience of restaurant billing. You will design tools that are used daily by thousands of servers, cashiers, and restaurant owners.",
    requirements: [
      "3+ years of experience designing complex web and mobile platforms.",
      "Strong portfolio demonstrating user research, user flows, and high-fidelity interface design.",
      "Proficiency in Figma and interactive prototyping tools.",
      "Experience creating and maintaining robust, scalable design systems."
    ],
    responsibilities: [
      "Conduct research sessions with restaurant operators to identify pain points.",
      "Translate requirements into intuitive mockups, user flows, and wireframes.",
      "Collaborate directly with engineering to ensure implementation matches design specs.",
      "Iterate on designs based on direct user testing and analytics."
    ],
  },
  {
    id: "customer-success",
    title: "Customer Success & Onboarding Specialist",
    department: "Sales & Success",
    location: "Mumbai, India (On-site)",
    type: "Full-time",
    description: "Be the face of our platform. Help new restaurants successfully adopt our billing system, solve onboarding challenges, and drive platform retention.",
    requirements: [
      "2+ years of experience in customer success, account management, or restaurant operations.",
      "Excellent verbal and written communication skills (English and Hindi).",
      "Patience and strong problem-solving skills for handling customer training.",
      "Willingness to travel locally to restaurant outlets for on-site setup and support."
    ],
    responsibilities: [
      "Manage onboarding pipelines for newly registered restaurants.",
      "Conduct software training sessions for cashiers, managers, and waitstaff.",
      "Troubleshoot hardware integration issues (printers, POS devices).",
      "Act as the primary feedback loop between operators and the product engineering team."
    ],
  },
]

const BENEFITS = [
  {
    icon: IconHeartHandshake,
    title: "Comprehensive Health Cover",
    desc: "Premium health insurance policies covering employees and their families.",
  },
  {
    icon: IconDeviceLaptop,
    title: "Top-tier Hardware",
    desc: "Get equipped with the latest MacBook Pro and a premium home office allowance.",
  },
  {
    icon: IconBook,
    title: "Learning Stipends",
    desc: "Annual credits for books, online courses, and attending tech conferences.",
  },
  {
    icon: IconCalendar,
    title: "Flexible Leave Policy",
    desc: "Flexible vacation structure designed to help you recharge when you need it.",
  },
  {
    icon: IconShield,
    title: "Wellness Allowances",
    desc: "Stipends for gym memberships, mental wellness counseling, and yoga classes.",
  },
  {
    icon: IconRocket,
    title: "Equity & Ownership",
    desc: "Substantial ESOP packages so you participate in the company's financial growth.",
  },
]

export default function Careers() {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    resume: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormState((prev) => ({ ...prev, [id]: value }))
  }

  const handleOpenApplication = () => {
    setIsApplying(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formState.name || !formState.email || !formState.phone || !formState.resume) {
      toast.error("Please fill out all required fields.")
      return
    }

    setSubmitting(true)

    // Simulate submission lag
    setTimeout(() => {
      setSubmitting(false)
      setIsApplying(false)
      setSelectedJob(null)
      toast.success("Application submitted successfully!", {
        description: `Thank you for applying for the ${selectedJob?.title} role. We will review it shortly.`,
      })
      setFormState({
        name: "",
        email: "",
        phone: "",
        resume: "",
        message: "",
      })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 h-[450px] w-[700px] -translate-x-1/2 opacity-15"
        style={{
          background: "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)",
          filter: "blur(120px)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-20 text-center">
          <Badge variant="secondary" className="mb-4 text-xs">
            <IconBriefcase className="mr-1.5 size-3" />
            Careers
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Build the Future of Restaurant Tech
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground leading-relaxed">
            We are building tools that empower restaurant owners to simplify operations, speed up billing, 
            and elevate their customer experience. Join our team and do the most meaningful work of your career.
          </p>
        </section>

        {/* Perks Section */}
        <section className="mb-24">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Perks & Benefits
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="shadow-sm">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Job Listings Section */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Open Roles
          </h2>
          <p className="mb-8 text-sm text-muted-foreground max-w-2xl">
            We are always looking for smart, driven individuals. Explore our open positions below 
            and let us know if there is a fit.
          </p>

          <div className="space-y-6">
            {JOB_LISTINGS.map((job) => (
              <Card key={job.id} className="transition-all duration-300 hover:ring-1 hover:ring-primary/20 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {job.department}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconMapPin className="size-3" />
                          {job.location}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconClock className="size-3" />
                          {job.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setSelectedJob(job)}
                      className="shrink-0 w-full sm:w-auto"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Job Details and Application Modal */}
      <Dialog 
        open={!!selectedJob} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedJob(null)
            setIsApplying(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl sm:p-8 max-h-[85vh] overflow-y-auto">
          {selectedJob && (
            <>
              {!isApplying ? (
                // Job Details Panel
                <>
                  <DialogHeader>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {selectedJob.department}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconMapPin className="size-3.5" />
                        {selectedJob.location}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconClock className="size-3.5" />
                        {selectedJob.type}
                      </span>
                    </div>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground text-left">
                      {selectedJob.title}
                    </DialogTitle>
                  </DialogHeader>

                  <Separator className="my-5" />

                  <div className="space-y-6 text-sm text-muted-foreground leading-relaxed text-left">
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">Role Overview</h4>
                      <p>{selectedJob.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">Requirements</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {selectedJob.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">Key Responsibilities</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {selectedJob.responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 border-t border-border pt-5">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleOpenApplication}>
                      Apply for this role
                    </Button>
                  </div>
                </>
              ) : (
                // Application Form Panel
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground text-left">
                      Apply for {selectedJob.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground text-left">
                      Complete the details below to submit your application.
                    </DialogDescription>
                  </DialogHeader>

                  <Separator className="my-4" />

                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        value={formState.name} 
                        onChange={handleInputChange} 
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="johndoe@example.com" 
                          value={formState.email} 
                          onChange={handleInputChange} 
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+91-9876543210" 
                          value={formState.phone} 
                          onChange={handleInputChange} 
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="resume">Resume Link <span className="text-destructive">*</span></Label>
                      <Input 
                        id="resume" 
                        type="url" 
                        placeholder="https://drive.google.com/file/... or portfolio link" 
                        value={formState.resume} 
                        onChange={handleInputChange} 
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">Cover Note (Optional)</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Introduce yourself and tell us why you're interested in this role..." 
                        rows={4}
                        value={formState.message} 
                        onChange={handleInputChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-border pt-4">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsApplying(false)}
                        disabled={submitting}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm" 
                        className="gap-1.5"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <IconSend className="size-4" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border mt-20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TheSmartBills. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Join a fast-growing team in food tech.
          </p>
        </div>
      </footer>
    </div>
  )
}
