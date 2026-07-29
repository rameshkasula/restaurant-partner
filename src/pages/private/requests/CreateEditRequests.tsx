import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUpdateRequest, useCreateRequest } from "@/hooks/useRequests"
import { type RestaurantRequest } from "@/api/requests.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEdit, IconPlus, IconAlertCircle } from "@tabler/icons-react"
import { toast } from "sonner"
import { APP_NAME } from "@/utils/constants"
import { FormDialog } from "@/components/FormDialog"

// ─── Zod Schema ─────────────────────────────────────────────────────────────
const requestSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required").max(150),
  name: z.string().min(1, "Contact person name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(15, "Phone number cannot exceed 15 characters"),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
})

type RequestFormData = z.infer<typeof requestSchema>

// ─── Inline Error Helper ─────────────────────────────────────────────────────
function InlineError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
      <IconAlertCircle className="size-3 shrink-0" stroke={2} />
      <span>{error}</span>
    </p>
  )
}

// ─── Edit Dialog Component ───────────────────────────────────────────────────
interface EditRequestDialogProps {
  request: RestaurantRequest
}

export function EditRequestDialog({ request }: EditRequestDialogProps) {
  const { mutateAsync: updateRequest, isPending } = useUpdateRequest()
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      restaurantName: request.restaurantName,
      name: request.name,
      email: request.email,
      phone: request.phone,
      city: request.city || "",
      state: request.state || "",
      message: request.message || "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        restaurantName: request.restaurantName,
        name: request.name,
        email: request.email,
        phone: request.phone,
        city: request.city || "",
        state: request.state || "",
        message: request.message || "",
      })
    }
  }, [open, request, reset])

  const onSubmit = async (data: RequestFormData) => {
    try {
      await updateRequest({
        id: request._id,
        data: {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          restaurantName: data.restaurantName.trim(),
          city: data.city?.trim() || undefined,
          state: data.state?.trim() || undefined,
          message: data.message?.trim() || undefined,
        },
      })
      toast.success("Request updated successfully!")
      setOpen(false)
    } catch (err: unknown) {
      toast.error("Failed to update request. Please make sure inputs are valid.")
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Edit Request Details"
      description={`Modify details for ${request.restaurantName}'s early access request.`}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Edit Request">
          <IconEdit className="size-4" stroke={1.75} />
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Save Changes"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-restaurantName">Restaurant Name *</Label>
          <Input
            id="edit-restaurantName"
            aria-invalid={!!errors.restaurantName}
            {...register("restaurantName")}
          />
          <InlineError error={errors.restaurantName?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-name">Contact Person *</Label>
          <Input
            id="edit-name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <InlineError error={errors.name?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-email">Email Address *</Label>
          <Input
            id="edit-email"
            type="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <InlineError error={errors.email?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-phone">Phone Number *</Label>
          <Input
            id="edit-phone"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <InlineError error={errors.phone?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-city">City</Label>
          <Input
            id="edit-city"
            aria-invalid={!!errors.city}
            {...register("city")}
          />
          <InlineError error={errors.city?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-state">State</Label>
          <Input
            id="edit-state"
            aria-invalid={!!errors.state}
            {...register("state")}
          />
          <InlineError error={errors.state?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-message">Message / Notes</Label>
        <Input
          id="edit-message"
          placeholder="Optional message from partner"
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        <InlineError error={errors.message?.message} />
      </div>
    </FormDialog>
  )
}

// ─── Create Dialog Component ─────────────────────────────────────────────────
export function CreateRequestDialog() {
  const { mutateAsync: createRequest, isPending } = useCreateRequest()
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      restaurantName: "",
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      message: "",
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (data: RequestFormData) => {
    try {
      await createRequest({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        restaurantName: data.restaurantName.trim(),
        city: data.city?.trim() || undefined,
        state: data.state?.trim() || undefined,
        message: data.message?.trim() || undefined,
      })
      toast.success("Request created successfully!")
      setOpen(false)
    } catch (err: unknown) {
      toast.error("Failed to create request. Please make sure inputs are valid.")
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Create New Request"
      description={`Submit details to request early access for ${APP_NAME}.`}
      trigger={
        <Button size="sm" className="flex items-center gap-1.5">
          <IconPlus className="size-4" stroke={2} />
          <span>Create Request</span>
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
      isPending={isPending}
      submitLabel="Submit Request"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-restaurantName">Restaurant Name *</Label>
          <Input
            id="create-restaurantName"
            placeholder="e.g. Pizza Palace"
            aria-invalid={!!errors.restaurantName}
            {...register("restaurantName")}
          />
          <InlineError error={errors.restaurantName?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-name">Contact Person *</Label>
          <Input
            id="create-name"
            placeholder="e.g. John Doe"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <InlineError error={errors.name?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-email">Email Address *</Label>
          <Input
            id="create-email"
            type="email"
            placeholder="e.g. john@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <InlineError error={errors.email?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-phone">Phone Number *</Label>
          <Input
            id="create-phone"
            placeholder="e.g. +91 98765 43210"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <InlineError error={errors.phone?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-city">City</Label>
          <Input
            id="create-city"
            placeholder="e.g. Mumbai"
            aria-invalid={!!errors.city}
            {...register("city")}
          />
          <InlineError error={errors.city?.message} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-state">State</Label>
          <Input
            id="create-state"
            placeholder="e.g. Maharashtra"
            aria-invalid={!!errors.state}
            {...register("state")}
          />
          <InlineError error={errors.state?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-message">Message / Notes</Label>
        <Input
          id="create-message"
          placeholder="Optional message or special request"
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        <InlineError error={errors.message?.message} />
      </div>
    </FormDialog>
  )
}
