import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import axios from "axios"
import { toast } from "sonner"
import { useLogin } from "@/hooks/useAuth"
import type { LoginDto } from "@/api/auth.api"
import { UserRole } from "@/api/users.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react"
import { BrandLogo } from "@/components/BrandLogo"
import { APP_NAME } from "@/utils/constants"
import { APP_PATHS } from "@/router/paths"

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState("")

  const { mutateAsync: loginRequest, isPending: loading } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginDto) => {
    setApiError("")
    try {
      const res = await loginRequest(data)
      if (res?.user) {
        localStorage.setItem("user_info", JSON.stringify(res.user))
      }
      toast.success("Welcome back! Logged in successfully.")
      const role = (res?.user?.role || "").toUpperCase()
      if (
        role === UserRole.SUPER_ADMIN ||
        role === UserRole.PLATFORM_MANAGER ||
        role === "SUPER_ADMIN" ||
        role === "PLATFORM_MANAGER"
      ) {
        navigate(APP_PATHS.DASHBOARD)
      } else {
        navigate(APP_PATHS.ANALYTICS)
      }
    } catch (err: unknown) {
      let errMsg = "Something went wrong. Please try again."
      if (axios.isAxiosError(err) && err.response?.data) {
        const resData = err.response.data as { message?: string | string[] }
        if (typeof resData.message === "string") {
          errMsg = resData.message
        } else if (
          Array.isArray(resData.message) &&
          resData.message.length > 0
        ) {
          errMsg = resData.message[0]
        }
      } else if (err instanceof Error) {
        errMsg = err.message
      }
      setApiError(errMsg)
      toast.error(errMsg)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Ambient blob */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>

        <Card className="shadow-xl shadow-black/5">
          <CardHeader className="pb-5">
            <CardTitle className="text-lg font-bold">Welcome back</CardTitle>
            <CardDescription className="text-xs">
              Sign in to your {APP_NAME} account.
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="pt-5">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              {apiError && (
                <Alert variant="destructive">
                  <IconAlertCircle className="size-4" stroke={2} />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <IconMail
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                    stroke={1.75}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@restaurant.com"
                    aria-invalid={!!errors.email}
                    className="pl-8"
                    autoComplete="email"
                    autoFocus
                    {...register("email", {
                      required: "Email address is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address.",
                      },
                      onChange: () => {
                        if (apiError) setApiError("")
                      },
                    })}
                  />
                </div>
                {errors.email?.message && (
                  <p className="flex items-center gap-1 text-[11px] text-destructive">
                    <IconAlertCircle className="size-3 shrink-0" stroke={2} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <IconLock
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                    stroke={1.75}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    className="pr-9 pl-8"
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required.",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters.",
                      },
                      onChange: () => {
                        if (apiError) setApiError("")
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <IconEyeOff className="size-3.5" stroke={1.75} />
                    ) : (
                      <IconEye className="size-3.5" stroke={1.75} />
                    )}
                  </button>
                </div>
                {errors.password?.message && (
                  <p className="flex items-center gap-1 text-[11px] text-destructive">
                    <IconAlertCircle className="size-3 shrink-0" stroke={2} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-2 w-full gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" stroke={2} />
                    Signing In…
                  </>
                ) : (
                  <>
                    Sign In
                    <IconArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to={APP_PATHS.REQUEST}
                  className="font-medium text-primary hover:underline"
                >
                  Request Early Access
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms
          </a>{" "}
          &amp;{" "}
          <a
            href="#"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
