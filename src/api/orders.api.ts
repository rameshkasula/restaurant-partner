import axiosInstance from "@/utils/axiosInstance"

export const OrderStatus = {
  PENDING: "PENDING",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const PaymentMode = {
  CASH: "CASH",
  CARD: "CARD",
  UPI: "UPI",
} as const

export type PaymentMode = (typeof PaymentMode)[keyof typeof PaymentMode]

export interface OrderItem {
  menuItemId: string
  quantity: number
  price: number
}

export interface Bill {
  subtotal: number
  tax: number
  total: number
  paymentMode: PaymentMode | null
  paidAt: string | null
}

export interface Order {
  _id: string
  id?: string
  outletId: string
  items: OrderItem[]
  status: OrderStatus
  bill: Bill
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateOrderDto {
  outletId: string
  items: OrderItem[]
  status?: OrderStatus
  bill: Bill
}

export interface UpdateOrderDto {
  outletId?: string
  items?: OrderItem[]
  status?: OrderStatus
  bill?: Partial<Bill>
}

export const orderApi = {
  list: (
    outletId?: string,
    includeDeleted = false,
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams()
    if (outletId) params.append("outletId", outletId)
    if (includeDeleted) params.append("includeDeleted", "true")
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    const query = params.toString() ? `?${params.toString()}` : ""
    return axiosInstance.get<any>(`/order${query}`).then((r) => r.data)
  },
  sales: (
    page?: number,
    limit?: number,
    outletId?: string,
    includeDeleted = false,
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    if (outletId) params.append("outletId", outletId)
    if (includeDeleted) params.append("includeDeleted", "true")
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    const query = params.toString() ? `?${params.toString()}` : ""
    return axiosInstance.get<any>(`/order/sales${query}`).then((r) => r.data)
  },
  create: (data: CreateOrderDto) =>
    axiosInstance.post<Order>("/order", data).then((r) => r.data),
  update: (id: string, data: UpdateOrderDto) =>
    axiosInstance.patch<Order>(`/order/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    axiosInstance.delete(`/order/${id}`).then((r) => r.data),
  restore: (id: string) =>
    axiosInstance.post<Order>(`/order/${id}/restore`).then((r) => r.data),
}
