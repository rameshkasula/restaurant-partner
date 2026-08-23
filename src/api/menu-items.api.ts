import axiosInstance from "@/utils/axiosInstance"

export const MenuItemCategory = {
  STARTER: 'STARTER',
  MAIN_COURSE: 'MAIN_COURSE',
  DESSERT: 'DESSERT',
  BEVERAGE: 'BEVERAGE',
  SIDES: 'SIDES',
} as const

export type MenuItemCategory = typeof MenuItemCategory[keyof typeof MenuItemCategory]

export const MENU_ITEM_CATEGORY_LABELS: Record<MenuItemCategory, string> = {
  [MenuItemCategory.STARTER]: "Starter",
  [MenuItemCategory.MAIN_COURSE]: "Main Course",
  [MenuItemCategory.DESSERT]: "Dessert",
  [MenuItemCategory.BEVERAGE]: "Beverage",
  [MenuItemCategory.SIDES]: "Sides",
}

export const MenuItemStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_HOLD: 'on hold',
} as const

export type MenuItemStatus = typeof MenuItemStatus[keyof typeof MenuItemStatus]

export interface MenuItem {
  _id: string
  id?: string
  outletId: string
  category: MenuItemCategory
  name: string
  description: string
  isVeg: boolean
  price: number
  isAvailable: boolean
  stock: number
  status: MenuItemStatus
  imageUrl?: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMenuItemDto {
  outletId: string
  category: MenuItemCategory
  name: string
  description: string
  isVeg: boolean
  price: number
  isAvailable?: boolean
  stock?: number
  status?: MenuItemStatus
  imageUrl?: string | null
}

export interface UpdateMenuItemDto {
  outletId?: string
  category?: MenuItemCategory
  name?: string
  description?: string
  isVeg?: boolean
  price?: number
  isAvailable?: boolean
  stock?: number
  status?: MenuItemStatus
  imageUrl?: string | null
}

export const menuItemApi = {
  list: (outletId?: string, includeDeleted = false) => {
    const params = new URLSearchParams()
    if (outletId) params.append("outletId", outletId)
    if (includeDeleted) params.append("includeDeleted", "true")
    const query = params.toString() ? `?${params.toString()}` : ""
    return axiosInstance.get<MenuItem[]>(`/menu-item${query}`).then((r) => r.data)
  },
  create: (data: CreateMenuItemDto) =>
    axiosInstance.post<MenuItem>("/menu-item", data).then((r) => r.data),
  update: (id: string, data: UpdateMenuItemDto) =>
    axiosInstance.patch<MenuItem>(`/menu-item/${id}`, data).then((r) => r.data),
  updateStatus: (id: string, status: MenuItemStatus) =>
    axiosInstance.patch<MenuItem>(`/menu-item/${id}/status`, { status }).then((r) => r.data),
  delete: (id: string) => axiosInstance.delete(`/menu-item/${id}`).then((r) => r.data),
  restore: (id: string) => axiosInstance.post<MenuItem>(`/menu-item/${id}/restore`).then((r) => r.data),
  bulkCreate: (items: CreateMenuItemDto[]) =>
    axiosInstance.post<MenuItem[]>("/menu-item/bulk", items).then((r) => r.data),
}
