import dayjs from "dayjs"
import _ from "lodash"

export function getTimeAgo(createdAt: string, timeTrigger: number) {
  if (timeTrigger < 0 || _.isNil(createdAt) || !dayjs(createdAt).isValid()) return ""
  
  const createdDayjs = dayjs(createdAt)
  const now = dayjs()
  
  const diffMins = now.diff(createdDayjs, "minute")
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = now.diff(createdDayjs, "hour")
  if (diffHours < 24) return `${diffHours}h ago`
  
  return createdDayjs.format("DD MMM")
}

export function formatTime(iso: string) {
  if (_.isNil(iso) || !dayjs(iso).isValid()) return "—"
  return dayjs(iso).format("hh:mm A")
}

export function formatCurrency(amount: number) {
  const value = _.toNumber(amount)
  if (_.isNaN(value) || _.isNil(amount)) return "₹0.00"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(iso: string) {
  if (_.isNil(iso) || !dayjs(iso).isValid()) return "—"
  return dayjs(iso).format("DD MMM YYYY")
}

export function formatDateTime(iso: string) {
  if (_.isNil(iso) || !dayjs(iso).isValid()) return "—"
  return dayjs(iso).format("DD MMM YYYY, hh:mm A")
}

export function formatShortId(id: any, len = 6): string {
  if (_.isNil(id)) return ""
  let str = ""
  if (_.isObject(id)) {
    str = _.toString(_.get(id, "_id") || _.get(id, "id") || "")
  } else {
    str = _.toString(id)
  }
  if (str.length <= len) return str
  return str.substring(str.length - len)
}

export function getIdString(val: any): string {
  if (_.isNil(val)) return ""
  if (_.isObject(val)) {
    return _.toString(_.get(val, "_id") || _.get(val, "id") || "")
  }
  return _.toString(val)
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
