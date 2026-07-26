import dayjs from "dayjs"

export function getTimeAgo(createdAt: string, timeTrigger: number) {
  if (timeTrigger < 0) return ""
  const diffMins = dayjs().diff(dayjs(createdAt), "minute")
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = dayjs().diff(dayjs(createdAt), "hour")
  if (diffHours < 24) return `${diffHours}h ago`
  
  return dayjs(createdAt).format("DD MMM")
}

export function formatTime(iso: string) {
  return dayjs(iso).format("hh:mm A")
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(iso: string) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

export function formatDateTime(iso: string) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

export function formatShortId(id: any, len = 6): string {
  if (!id) return ""
  const str = typeof id === "object" ? String(id._id || id.id || "") : String(id)
  if (str.length <= len) return str
  return str.substring(str.length - len)
}

export function getDefaultDateRange() {
  return {
    from: dayjs().subtract(7, "day").startOf("day").toDate(),
    to: dayjs().endOf("day").toDate(),
  }
}

export function getDefaultDateRangeStrings() {
  return {
    startDate: dayjs().subtract(7, "day").startOf("day").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("day").format("YYYY-MM-DD"),
  }
}
