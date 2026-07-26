import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  deleted?: boolean
  status?: string
}

export function StatusBadge({ deleted, status }: StatusBadgeProps) {
  if (deleted) {
    return (
      <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
        Deleted
      </Badge>
    )
  }

  const normalizedStatus = status?.toLowerCase() || "active"

  switch (normalizedStatus) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/35 text-emerald-600 bg-emerald-500/5 dark:text-emerald-400 dark:bg-emerald-500/10 text-[10px] uppercase font-bold tracking-wider"
        >
          Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider">
          Inactive
        </Badge>
      )
    case "on hold":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/35 text-amber-600 bg-amber-500/5 dark:text-amber-400 dark:bg-amber-500/10 text-[10px] uppercase font-bold tracking-wider"
        >
          On Hold
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
          {status || "Unknown"}
        </Badge>
      )
  }
}
