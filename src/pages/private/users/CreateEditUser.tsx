/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMsg } from "@/components/ErrorMsg"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  IconPlus,
  IconPencil,
  IconAlertCircle,
  IconLoader2,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { UserRole, USER_ROLE_LABELS, type User } from "@/api/users.api"
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers"

// ── Helpers ───────────────────────────────────────────────────────────────────

function InlineError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
      <IconAlertCircle className="size-3 shrink-0" stroke={2} />
      <span>{error}</span>
    </p>
  )
}


// ── Form Data ─────────────────────────────────────────────────────────────────

interface UserFormData {
  email: string
  password: string
  role: UserRole
  organizationId: string
  outletId: string
}

// ── Shared Dialog Form ────────────────────────────────────────────────────────

interface UserDialogFormProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultValues: UserFormData
  onSubmit: (data: UserFormData) => void
  isPending: boolean
  apiError: string
  isEdit?: boolean
  orgs: any[]
  outlets: any[]
}

function UserDialogForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending,
  apiError,
  isEdit = false,
  orgs = [],
  outlets = [],
}: UserDialogFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<UserFormData>({ defaultValues })

  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedRole = watch("role") as UserRole
  const selectedOrgId = watch("organizationId")

  // Filter outlets by selected organization
  const filteredOutlets = outlets.filter(
    (o) =>
      !o.deletedAt &&
      (selectedOrgId ? o.organizationId === selectedOrgId : true)
  )

  const isPlatformRole =
    selectedRole === UserRole.SUPER_ADMIN ||
    selectedRole === UserRole.PLATFORM_MANAGER

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the user's details. Leave password blank to keep unchanged."
              : "Add a new user to the platform."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-1"
          noValidate
        >
          {apiError && <ErrorMsg message={apiError} />}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-email" className="font-medium text-foreground">
              Email *
            </Label>
            <Input
              id="user-email"
              type="email"
              placeholder="user@example.com"
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            <InlineError error={errors.email?.message} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="user-password"
              className="font-medium text-foreground"
            >
              Password {isEdit ? "" : "*"}
            </Label>
            <div className="relative">
              <Input
                id="user-password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  isEdit ? "Leave blank to keep unchanged" : "Min. 6 characters"
                }
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password", {
                  required: isEdit ? false : "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters.",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <IconEyeOff className="size-4" stroke={1.75} />
                ) : (
                  <IconEye className="size-4" stroke={1.75} />
                )}
              </button>
            </div>
            <InlineError error={errors.password?.message} />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-role" className="font-medium text-foreground">
              Role *
            </Label>
            <NativeSelect
              id="user-role"
              aria-invalid={!!errors.role}
              {...register("role", { required: "Role is required." })}
              className="h-9 w-full text-sm"
            >
              {Object.values(UserRole).map((role) => (
                <NativeSelectOption key={role} value={role}>
                  {USER_ROLE_LABELS[role]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <InlineError error={errors.role?.message} />
          </div>

          {/* Organization (only for non-platform roles) */}
          {!isPlatformRole && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-org" className="font-medium text-foreground">
                Organization *
              </Label>
              <NativeSelect
                id="user-org"
                aria-invalid={!!(errors as any).organizationId}
                {...register("organizationId", {
                  validate: (value) => {
                    if (!value && !watch("outletId")) {
                      return "Either Organization or Outlet must be selected."
                    }
                    return true
                  },
                  onChange: () => {
                    trigger("outletId")
                  },
                })}
                className="h-9 w-full text-sm"
              >
                <NativeSelectOption value="">— None —</NativeSelectOption>
                {orgs
                  .filter((o) => !o.deletedAt)
                  .map((org) => {
                    const id = org._id || org.id
                    return (
                      <NativeSelectOption key={id} value={id}>
                        {org.name}
                      </NativeSelectOption>
                    )
                  })}
              </NativeSelect>
              <InlineError error={(errors as any).organizationId?.message} />
            </div>
          )}

          {/* Outlet (only for non-platform roles) */}
          {!isPlatformRole && (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="user-outlet"
                className="font-medium text-foreground"
              >
                Outlet *
              </Label>
              <NativeSelect
                id="user-outlet"
                aria-invalid={!!(errors as any).outletId}
                {...register("outletId", {
                  validate: (value) => {
                    if (!value && !watch("organizationId")) {
                      return "Either Organization or Outlet must be selected."
                    }
                    return true
                  },
                  onChange: () => {
                    trigger("organizationId")
                  },
                })}
                className="h-9 w-full text-sm"
              >
                <NativeSelectOption value="">— None —</NativeSelectOption>
                {filteredOutlets.map((outlet) => (
                  <NativeSelectOption key={outlet._id} value={outlet._id}>
                    {outlet.name}
                    {outlet.organizationId ? "" : " (Standalone)"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {filteredOutlets.length === 0 && selectedOrgId && (
                <p className="text-[11px] text-muted-foreground">
                  No outlets found for the selected organization.
                </p>
              )}
              <InlineError error={(errors as any).outletId?.message} />
            </div>
          )}

          <DialogFooter className="mt-2">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && (
                <IconLoader2 className="size-3.5 animate-spin" stroke={2} />
              )}
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Create User Dialog ────────────────────────────────────────────────────────

export function CreateUserDialog({ orgs = [], outlets = [] }: { orgs?: any[]; outlets?: any[] }) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState("")

  const { mutate, isPending } = useCreateUser()

  const defaultValues: UserFormData = {
    email: "",
    password: "",
    role: UserRole.MANAGER,
    organizationId: "",
    outletId: "",
  }

  const onSubmit = (data: UserFormData) => {
    setApiError("")
    const isPlatformRole =
      data.role === UserRole.SUPER_ADMIN ||
      data.role === UserRole.PLATFORM_MANAGER

    mutate(
      {
        email: data.email.trim(),
        password: data.password,
        role: data.role as UserRole,
        organizationId: isPlatformRole ? null : data.organizationId || null,
        outletId: isPlatformRole ? null : data.outletId || null,
      },
      {
        onSuccess: () => {
          toast.success("User created successfully!")
          setOpen(false)
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err.message ||
            "Failed to create user."
          setApiError(msg)
          toast.error(msg)
        },
      }
    )
  }

  return (
    <>
      <Button
        className="gap-1.5"
        onClick={() => {
          setApiError("")
          setOpen(true)
        }}
      >
        <IconPlus className="size-3.5" />
        New User
      </Button>
      <UserDialogForm
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setApiError("")
        }}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isPending={isPending}
        apiError={apiError}
        isEdit={false}
        orgs={orgs}
        outlets={outlets}
      />
    </>
  )
}

// ── Edit User Dialog ──────────────────────────────────────────────────────────

export function EditUserDialog({
  user,
  orgs = [],
  outlets = [],
}: {
  user: User
  orgs?: any[]
  outlets?: any[]
}) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState("")

  const { mutate, isPending } = useUpdateUser()

  const userId = user._id || user.id || ""

  const defaultValues: UserFormData = {
    email: user.email,
    password: "",
    role: user.role,
    organizationId: user.organizationId ?? "",
    outletId: user.outletId ?? "",
  }

  const onSubmit = (data: UserFormData) => {
    setApiError("")
    const isPlatformRole =
      data.role === UserRole.SUPER_ADMIN ||
      data.role === UserRole.PLATFORM_MANAGER

    const payload: any = {
      email: data.email.trim(),
      role: data.role,
      organizationId: isPlatformRole ? null : data.organizationId || null,
      outletId: isPlatformRole ? null : data.outletId || null,
    }
    if (data.password) payload.password = data.password

    mutate(
      { id: userId, payload },
      {
        onSuccess: () => {
          toast.success("User updated successfully!")
          setOpen(false)
          setApiError("")
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err.message ||
            "Failed to update user."
          setApiError(msg)
          toast.error(msg)
        },
      }
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Edit user"
        onClick={() => {
          setApiError("")
          setOpen(true)
        }}
      >
        <IconPencil className="size-3.5" stroke={1.75} />
      </Button>
      <UserDialogForm
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setApiError("")
        }}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isPending={isPending}
        apiError={apiError}
        isEdit={true}
        orgs={orgs}
        outlets={outlets}
      />
    </>
  )
}
