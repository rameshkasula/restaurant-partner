import { APP_PATHS } from "@/router/paths"

import {
  IconLayoutDashboard,
  IconClock,
  IconBuildingStore,
  IconReceipt,
  IconBook2,
  IconMapPin,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PLATFORM_MANAGER: "PLATFORM_MANAGER",

  // Tenant Level (Restaurant Vendors)
  RESTAURANT_OWNER: "RESTAURANT_OWNER",
  MANAGER: "MANAGER",
  POS_STAFF: "POS_STAFF",
  KITCHEN_STAFF: "KITCHEN_STAFF",
} as const

export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ["SUPER_ADMIN"],
  [ROLES.PLATFORM_MANAGER]: ["PLATFORM_MANAGER"],
  [ROLES.RESTAURANT_OWNER]: ["RESTAURANT_OWNER", "PLATFORM_MANAGER"],
  [ROLES.MANAGER]: ["MANAGER", "RESTAURANT_OWNER", "PLATFORM_MANAGER"],
  [ROLES.POS_STAFF]: [
    "POS_STAFF",
    "MANAGER",
    "RESTAURANT_OWNER",
    "PLATFORM_MANAGER",
  ],
  [ROLES.KITCHEN_STAFF]: [
    "KITCHEN_STAFF",
    "MANAGER",
    "RESTAURANT_OWNER",
    "PLATFORM_MANAGER",
  ],
}

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: APP_PATHS.DASHBOARD,
    icon: IconLayoutDashboard,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.PLATFORM_MANAGER],
  },
  {
    // analytics
    label: "Analytics",
    path: APP_PATHS.ANALYTICS,
    icon: IconLayoutDashboard,
    allowedRoles: [
      ROLES.RESTAURANT_OWNER,
      ROLES.MANAGER,
      ROLES.POS_STAFF,
      ROLES.KITCHEN_STAFF,
    ],
  },
  {
    label: "Requests",
    path: APP_PATHS.REQUESTS,
    icon: IconClock,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.PLATFORM_MANAGER],
  },
  {
    label: "Organizations",
    path: APP_PATHS.ORGANIZATIONS,
    icon: IconBuildingStore,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.PLATFORM_MANAGER],
  },
  {
    label: "Orders",
    path: APP_PATHS.ORDERS,
    icon: IconReceipt,
    allowedRoles: [
      ROLES.RESTAURANT_OWNER,
      ROLES.MANAGER,
      ROLES.POS_STAFF,
      ROLES.KITCHEN_STAFF,
    ],
  },
  {
    label: "Menu Items",
    path: APP_PATHS.MENU_ITEMS,
    icon: IconBook2,
    allowedRoles: [
      ROLES.RESTAURANT_OWNER,
      ROLES.MANAGER,
      ROLES.POS_STAFF,
      ROLES.KITCHEN_STAFF,
    ],
  },
  {
    label: "Outlets",
    path: APP_PATHS.OUTLETS,
    icon: IconMapPin,
    allowedRoles: [ROLES.RESTAURANT_OWNER, ROLES.MANAGER],
  },
  {
    label: "Users",
    path: APP_PATHS.USERS,
    icon: IconUsers,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.PLATFORM_MANAGER],
  },
  {
    label: "Plans",
    path: APP_PATHS.PLANS,
    icon: IconSettings,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.PLATFORM_MANAGER],
  },
  {
    label: "Staff",
    path: APP_PATHS.STAFF,
    icon: IconUsers,
    allowedRoles: [ROLES.RESTAURANT_OWNER, ROLES.MANAGER],
  },
]
