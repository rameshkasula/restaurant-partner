import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
