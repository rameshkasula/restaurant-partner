import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { getAccessToken } from "@/utils/tokens"
import PrivateLayout from "@/components/PrivateLayout"
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary"
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
const PricingPage = Loadable(lazy(() => import("@pages/public/Pricing")))
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
const Plans = Loadable(lazy(() => import("@pages/private/plans/index")))
const Staff = Loadable(lazy(() => import("@pages/private/Staff")))
const Kot = Loadable(lazy(() => import("@pages/private/kot")))


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
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.REQUEST,
    element: <Register />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.LOGIN,
    element: <Login />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.FORGOT_PASSWORD,
    element: <ForgotPassword />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.RESET_PASSWORD,
    element: <ResetPassword />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.PRIVACY_POLICY,
    element: <PrivacyPolicy />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.TERMS_OF_SERVICE,
    element: <TermsOfService />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.COOKIE_POLICY,
    element: <CookiePolicy />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.BLOGS,
    element: <Blogs />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.CAREERS,
    element: <Careers />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.PRICING,
    element: <PricingPage />,
    errorElement: <GlobalErrorBoundary />,
  },
  {
    path: APP_PATHS.HOME,
    element: <ProtectedRoute />,
    errorElement: <GlobalErrorBoundary />,
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
      {
        path: APP_PATHS.KOT,
        element: <Kot />,
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
