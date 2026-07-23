import { useState } from "react"
import { Link } from "react-router-dom"
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconBook,
  IconArrowUpRight,
} from "@tabler/icons-react"
import { BrandLogo } from "@/components/BrandLogo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BlogPost {
  id: string
  title: string
  description: string
  category: "Technology" | "Operations" | "Growth"
  readTime: string
  date: string
  author: {
    name: string
    role: string
    avatar: string
  }
  content: string[]
  isFeatured?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "smart-billing-revolution",
    title: "How Smart Billing is Revolutionizing Indian Diner Operations",
    description: "Explore how cloud-based billing systems are reducing checkout times by 40% and helping restaurants handle peak hour rushes with ease.",
    category: "Operations",
    readTime: "5 min read",
    date: "July 20, 2026",
    author: {
      name: "Rajesh Kumar",
      role: "Co-founder",
      avatar: "RK",
    },
    isFeatured: true,
    content: [
      "In the fast-paced world of Indian dining, peak hours can make or break a restaurant's reputation. Long lines at the checkout counter, misplaced orders, and delays in table rotation are common bottlenecks that directly impact customer satisfaction.",
      "Cloud-based billing solutions are changing the game. By moving away from legacy, offline systems, restaurants can now sync orders instantly between the waitstaff's hand-held devices and the kitchen display system (KDS). This eliminates communication lag and ensures order accuracy.",
      "Furthermore, table-side QR code ordering and instant digital payments allow customers to view, split, and pay their bills without waiting for the physical check. Early metrics indicate that restaurants adopting these billing workflows experience a 40% reduction in checkout times and a significant boost in table turnover rates.",
    ],
  },
  {
    id: "cloud-kitchen-growth",
    title: "Unlocking Growth: 5 Marketing Strategies for Cloud Kitchens",
    description: "Discover actionable insights on using data analytics, personalized discounts, and social media automation to drive repeat orders.",
    category: "Growth",
    readTime: "7 min read",
    date: "July 15, 2026",
    author: {
      name: "Priya Sharma",
      role: "Head of Growth",
      avatar: "PS",
    },
    content: [
      "Unlike traditional dine-in restaurants, cloud kitchens rely entirely on digital visibility to survive. Without a physical storefront, marketing isn't just an addition—it is the lifeblood of the business.",
      "First, prioritize customer data ownership. Rather than relying solely on third-party aggregators, push customers toward direct ordering channels using attractive first-order discounts and exclusive loyalty credits.",
      "Second, implement smart retargeting. Use purchase history to run tailored campaigns (e.g., offering a discount on Biryani to users who ordered it last Friday). Combine this with automated SMS reminders during pre-lunch and pre-dinner hours to capture impulsive orders.",
    ],
  },
  {
    id: "restaurant-tech-stack",
    title: "The Tech Stack Every Modern Restaurant Needs in 2026",
    description: "From IoT-enabled kitchen displays to AI inventory forecasting, here is the technology that will define successful food businesses.",
    category: "Technology",
    readTime: "6 min read",
    date: "July 10, 2026",
    author: {
      name: "Amit Verma",
      role: "CTO",
      avatar: "AV",
    },
    content: [
      "The definition of a restaurant has evolved beyond a kitchen and dining hall. Today, it is a high-volume operations center that relies on seamless data flows to run efficiently.",
      "A modern restaurant tech stack starts with an open API Point of Sale (POS) system. This allows third-party delivery platforms, accounting tools, and CRM software to interact seamlessly, preventing manual data entries.",
      "The next critical layer is AI-driven inventory forecasting. By checking historical sales, local events, and weather forecasts, these tools predict raw material requirements. This reduces food waste by up to 25% and ensures you never run out of signature ingredients.",
    ],
  },
  {
    id: "food-waste-inventory",
    title: "Reducing Food Waste: An Inventory Management Guide",
    description: "Food wastage eats directly into your profit margins. Learn how real-time inventory tracking can save you thousands of rupees.",
    category: "Operations",
    readTime: "8 min read",
    date: "July 05, 2026",
    author: {
      name: "Vikram Mehta",
      role: "Operations Lead",
      avatar: "VM",
    },
    content: [
      "Wastage is the silent profit-killer in the culinary industry. An estimated 6-10% of raw ingredients purchased by restaurants end up in the trash bin due to spoilage, over-purchasing, or preparation mistakes.",
      "Solving this begins with implementing a strict First-In, First-Out (FIFO) protocol in your cold rooms. Tag every batch with its receiving date and shelf life. When combined with barcode scanning in your POS inventory modules, you get alerted automatically when items are nearing expiry.",
      "Additionally, implement recipe standardization. Defining precise measurements for every ingredient ensures portion consistency, making it easy to track variance between theoretical stock and actual physical stock.",
    ],
  },
]

export default function Blogs() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null)

  const categories = ["All", "Technology", "Operations", "Growth"]

  const filteredPosts = BLOG_POSTS.filter((post) => {
    if (selectedCategory === "All") return true
    return post.category === selectedCategory
  })

  const featuredPost = BLOG_POSTS.find((post) => post.isFeatured)

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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className="mb-12 text-center lg:text-left">
          <Badge variant="secondary" className="mb-4 text-xs">
            <IconBook className="mr-1.5 size-3" />
            Resources
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            TheSmartBills Blog
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Actionable guides, technology trends, and industry insights curated specifically 
            for Indian restaurant owners and operators.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "All" && (
          <section className="mb-16">
            <Card className="overflow-hidden border-primary/20 bg-primary/5 shadow-md">
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="default" className="text-[10px]">
                        Featured
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {featuredPost.category}
                      </Badge>
                    </div>
                    <h2 
                      onClick={() => setActiveArticle(featuredPost)}
                      className="cursor-pointer text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors sm:text-3xl"
                    >
                      {featuredPost.title}
                    </h2>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {featuredPost.description}
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                          {featuredPost.author.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{featuredPost.author.name}</p>
                          <p className="text-[10px] text-muted-foreground">{featuredPost.author.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconCalendar className="size-3.5" />
                          {featuredPost.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconClock className="size-3.5" />
                          {featuredPost.readTime}
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setActiveArticle(featuredPost)}
                      className="mt-6 w-full sm:w-auto gap-1.5"
                    >
                      Read Article
                      <IconArrowUpRight className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="relative hidden min-h-[300px] bg-primary/10 lg:col-span-5 lg:block">
                  <div className="absolute inset-0 flex items-center justify-center text-primary/30">
                    <IconBook className="size-24 stroke-[1]" />
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Filters and Grid */}
        <section>
          {/* Category Tabs */}
          <div className="mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 border-b border-border pb-4">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-xs font-medium"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Grid of articles */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:ring-1 hover:ring-primary/20">
                <CardHeader className="p-5 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {post.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 
                    onClick={() => setActiveArticle(post)}
                    className="cursor-pointer text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                    {post.description}
                  </p>
                  <div>
                    <Separator className="mb-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {post.author.avatar}
                        </div>
                        <span className="text-xs font-medium text-foreground">{post.author.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveArticle(post)}
                        className="h-8 px-2 text-xs text-primary hover:text-primary hover:bg-primary/5 gap-1"
                      >
                        Read
                        <IconArrowUpRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Article Dialog / Modal */}
      <Dialog open={!!activeArticle} onOpenChange={(open) => !open && setActiveArticle(null)}>
        <DialogContent className="max-w-2xl sm:p-8 max-h-[85vh] overflow-y-auto">
          {activeArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {activeArticle.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">• {activeArticle.readTime}</span>
                  <span className="text-[10px] text-muted-foreground">• {activeArticle.date}</span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground text-left leading-snug">
                  {activeArticle.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                    {activeArticle.author.avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">{activeArticle.author.name}</p>
                    <p className="text-[10px] text-muted-foreground">{activeArticle.author.role}</p>
                  </div>
                </div>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                {activeArticle.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button size="sm" onClick={() => setActiveArticle(null)}>
                  Close Article
                </Button>
              </div>
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
            Sharing restaurant insights & operations guides.
          </p>
        </div>
      </footer>
    </div>
  )
}
