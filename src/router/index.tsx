import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { getAccessToken } from "@/utils/tokens"
import PrivateLayout from "@/components/PrivateLayout"
import { APP_PATHS } from "./paths"

// A Loadable HOC to wrap lazy components with Suspense and a loading spinner
const Loadable = (Component: React.ComponentType) => () => (
  <Suspense
    fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }
  >
    <Component />
  </Suspense>
)

const Home = Loadable(lazy(() => import("@pages/public/Home")))
const PrivacyPolicy = Loadable(
  lazy(() => import("@pages/public/PrivacyPolicy"))
)
const TermsOfService = Loadable(
  lazy(() => import("@pages/public/TermsOfService"))
)
const CookiePolicy = Loadable(lazy(() => import("@pages/public/CookiePolicy")))
const Blogs = Loadable(lazy(() => import("@pages/public/Blogs")))
const Careers = Loadable(lazy(() => import("@pages/public/Careers")))
const Register = Loadable(lazy(() => import("@pages/auth/Register")))
const Login = Loadable(lazy(() => import("@pages/auth/Login")))
const ForgotPassword = Loadable(
  lazy(() => import("@pages/auth/ForgotPassword"))
)
const ResetPassword = Loadable(lazy(() => import("@pages/auth/ResetPassword")))
const Dashboard = Loadable(lazy(() => import("@pages/private/dashboard")))
const Analytics = Loadable(lazy(() => import("@pages/private/analytics")))
const Billing = Loadable(lazy(() => import("@pages/private/billing")))
const Orders = Loadable(lazy(() => import("@pages/private/orders")))
const MenuItems = Loadable(lazy(() => import("@pages/private/menuitems")))
const Outlets = Loadable(lazy(() => import("@pages/private/outlets/index")))
const Users = Loadable(lazy(() => import("@pages/private/users/index")))
const Organizations = Loadable(
  lazy(() => import("@pages/private/organizations/index"))
)
const Requests = Loadable(lazy(() => import("@pages/private/requests/index")))
const Plans = Loadable(lazy(() => import("@pages/private/Plans")))
const Staff = Loadable(lazy(() => import("@pages/private/Staff")))

// Authentication check based on access token cookie
const isAuthenticated = () => {
  return !!getAccessToken()
}

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <PrivateLayout />
}

const router = createBrowserRouter([
  {
    path: APP_PATHS.HOME,
    element: <Home />,
  },
  {
    path: APP_PATHS.REQUEST,
    element: <Register />,
  },
  {
    path: APP_PATHS.LOGIN,
    element: <Login />,
  },
  {
    path: APP_PATHS.FORGOT_PASSWORD,
    element: <ForgotPassword />,
  },
  {
    path: APP_PATHS.RESET_PASSWORD,
    element: <ResetPassword />,
  },
  {
    path: APP_PATHS.PRIVACY_POLICY,
    element: <PrivacyPolicy />,
  },
  {
    path: APP_PATHS.TERMS_OF_SERVICE,
    element: <TermsOfService />,
  },
  {
    path: APP_PATHS.COOKIE_POLICY,
    element: <CookiePolicy />,
  },
  {
    path: APP_PATHS.BLOGS,
    element: <Blogs />,
  },
  {
    path: APP_PATHS.CAREERS,
    element: <Careers />,
  },
  {
    path: APP_PATHS.HOME,
    element: <ProtectedRoute />,
    children: [
      {
        path: APP_PATHS.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: APP_PATHS.ANALYTICS,
        element: <Analytics />,
      },
      {
        path: APP_PATHS.BILLING,
        element: <Billing />,
      },
      {
        path: APP_PATHS.ORDERS,
        element: <Orders />,
      },
      {
        path: APP_PATHS.MENU_ITEMS,
        element: <MenuItems />,
      },
      {
        path: APP_PATHS.OUTLETS,
        element: <Outlets />,
      },
      {
        path: APP_PATHS.USERS,
        element: <Users />,
      },
      {
        path: APP_PATHS.ORGANIZATIONS,
        element: <Organizations />,
      },
      {
        path: APP_PATHS.REQUESTS,
        element: <Requests />,
      },
      {
        path: APP_PATHS.PLANS,
        element: <Plans />,
      },
      {
        path: APP_PATHS.STAFF,
        element: <Staff />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={APP_PATHS.HOME} replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
