import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// ── StatCard ─────────────────────────────────────────────────────────────────
// Full card variant — used in dashboard-style grids.

export interface StatCardProps {
  title: string
  value: React.ReactNode
  loading?: boolean
  description: string
  icon: React.ComponentType<any>
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  loading,
  description,
  icon: Icon,
  iconClassName = "size-4 text-muted-foreground",
}: StatCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={iconClassName} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <Skeleton className="h-8 w-12" /> : value}
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// ── StatPill ──────────────────────────────────────────────────────────────────
// Compact inline pill — used in table/list page headers to show quick counts.
//
// Usage:
//   <StatPill icon={IconCircleCheckFilled} label="Active" value={12} iconClassName="text-emerald-500" />

export interface StatPillProps {
  icon: React.ElementType
  label: string
  value: number | string
  iconClassName?: string
}

export function StatPill({ icon: Icon, label, value, iconClassName }: StatPillProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
      <Icon className={cn("size-3.5", iconClassName)} stroke={2} />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

// ── StatPillGroup ─────────────────────────────────────────────────────────────
// Wrapper that lays out multiple StatPills in a consistent flex row.

export function StatPillGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
