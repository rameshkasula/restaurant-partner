/* eslint-disable prettier/prettier */
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { orgApi } from "@/api/organizations.api"
import { type Outlet } from "@/api/outlets.api"
import { useCreateOutlet, useUpdateOutlet } from "@/hooks/useOutlets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMsg } from "@/components/ErrorMsg"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  IconPlus,
  IconPencil,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react"
import { toast } from "sonner"

function InlineError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
      <IconAlertCircle className="size-3 shrink-0" stroke={2} />
      <span>{error}</span>
    </p>
  )
}

interface OutletFormData {
  name: string
  organizationId: string
  address: string
  isCustomerapp: string
  gstin: string
  pan: string
  status: string
}

export function CreateOutletDialog() {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState("")

  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: orgApi.list,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OutletFormData>({
    defaultValues: {
      name: "",
      organizationId: "",
      address: "",
      isCustomerapp: "false",
      gstin: "",
      pan: "",
      status: "active",
    },
  })

  const { mutate, isPending } = useCreateOutlet()

  const onSubmit = (data: OutletFormData) => {
    setApiError("")
    mutate(
      {
        name: data.name.trim(),
        organizationId: data.organizationId || null,
        address: data.address.trim(),
        isCustomerapp: data.isCustomerapp === "true",
        gstin: data.gstin.trim() || null,
        pan: data.pan.trim() || null,
        status: data.status,
      },
      {
        onSuccess: () => {
          toast.success("Outlet created successfully!")
          setOpen(false)
          reset()
        },
        onError: (err: any) => {
          const msg = err.message || "Failed to create outlet."
          setApiError(msg)
          toast.error(msg)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          reset()
          setApiError("")
        }
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <IconPlus className="size-4" stroke={2} />
            <span>Create Outlet</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Outlet</DialogTitle>
          <DialogDescription>
            Add a new restaurant outlet and link it to an organization.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
          noValidate
        >
          {apiError && <ErrorMsg message={apiError} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-outletName">Outlet Name *</Label>
              <Input
                id="create-outletName"
                placeholder="e.g. Spice Garden Bandra"
                aria-invalid={!!errors.name}
                {...register("name", { required: "Outlet name is required." })}
              />
              <InlineError error={errors.name?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-outletOrg">Organization</Label>
              <NativeSelect
                id="create-outletOrg"
                className="w-full"
                disabled={orgsLoading}
                {...register("organizationId")}
              >
                <OptionPlaceholder value="" label="None (Standalone)" />
                {orgs
                  .filter((o) => !o.deletedAt)
                  .map((org) => (
                    <NativeSelectOption
                      key={org._id || org.id}
                      value={org._id || org.id}
                    >
                      {org.name}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-address">Address *</Label>
            <Input
              id="create-address"
              placeholder="e.g. 123 Main St, Bandra West, Mumbai"
              aria-invalid={!!errors.address}
              {...register("address", { required: "Address is required." })}
            />
            <InlineError error={errors.address?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-gstin">GSTIN (Optional)</Label>
              <Input
                id="create-gstin"
                placeholder="e.g. 27AAAAA1111A1Z1"
                aria-invalid={!!errors.gstin}
                {...register("gstin", {
                  pattern: {
                    value:
                      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                    message: "Invalid GSTIN format.",
                  },
                })}
              />
              <InlineError error={errors.gstin?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-pan">PAN (Optional)</Label>
              <Input
                id="create-pan"
                placeholder="e.g. ABCDE1234F"
                aria-invalid={!!errors.pan}
                {...register("pan", {
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: "Invalid PAN format.",
                  },
                })}
              />
              <InlineError error={errors.pan?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-isCustomerapp">Customer App Enabled</Label>
              <NativeSelect
                id="create-isCustomerapp"
                className="w-full"
                {...register("isCustomerapp")}
              >
                <NativeSelectOption value="false">
                  No (Disabled)
                </NativeSelectOption>
                <NativeSelectOption value="true">
                  Yes (Enabled)
                </NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-status">Status</Label>
              <NativeSelect
                id="create-status"
                className="w-full"
                {...register("status")}
              >
                <NativeSelectOption value="active">Active</NativeSelectOption>
                <NativeSelectOption value="inactive">
                  Inactive
                </NativeSelectOption>
                <NativeSelectOption value="on hold">On Hold</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-3">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && (
                <IconLoader2 className="size-4 animate-spin" stroke={2} />
              )}
              {isPending ? "Creating..." : "Create Outlet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getOrgIdString(val: any): string {
  if (!val) return ""
  if (typeof val === "object" && val !== null) {
    return val._id || val.id || ""
  }
  return String(val)
}

interface EditOutletDialogProps {
  outlet: Outlet
}

export function EditOutletDialog({ outlet }: EditOutletDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState("")

  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: orgApi.list,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OutletFormData>({
    defaultValues: {
      name: outlet.name,
      organizationId: getOrgIdString(outlet.organizationId),
      address: outlet.address || "",
      isCustomerapp: outlet.isCustomerapp ? "true" : "false",
      gstin: outlet.gstin || "",
      pan: outlet.pan || "",
      status: outlet.status || "active",
    },
  })

  // Keep form values in sync with outlet prop if it changes
  useEffect(() => {
    if (open) {
      reset({
        name: outlet.name,
        organizationId: getOrgIdString(outlet.organizationId),
        address: outlet.address || "",
        isCustomerapp: outlet.isCustomerapp ? "true" : "false",
        gstin: outlet.gstin || "",
        pan: outlet.pan || "",
        status: outlet.status || "active",
      })
    }
  }, [outlet, open, reset])

  const { mutate, isPending } = useUpdateOutlet()

  const onSubmit = (data: OutletFormData) => {
    setApiError("")

    // Check if anything actually changed
    const hasChanged =
      data.name.trim() !== outlet.name ||
      data.organizationId !== getOrgIdString(outlet.organizationId) ||
      data.address.trim() !== (outlet.address || "") ||
      (data.isCustomerapp === "true") !== (outlet.isCustomerapp ?? false) ||
      data.gstin.trim() !== (outlet.gstin || "") ||
      data.pan.trim() !== (outlet.pan || "") ||
      data.status !== (outlet.status || "active")

    if (!hasChanged) {
      setOpen(false)
      return
    }

    mutate(
      {
        id: outlet._id,
        data: {
          name: data.name.trim(),
          organizationId: data.organizationId || null,
          address: data.address.trim(),
          isCustomerapp: data.isCustomerapp === "true",
          gstin: data.gstin.trim() || null,
          pan: data.pan.trim() || null,
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          toast.success("Outlet updated successfully!")
          setOpen(false)
          setApiError("")
        },
        onError: (err: any) => {
          const msg = err.message || "Failed to update outlet."
          setApiError(msg)
          toast.error(msg)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          reset()
          setApiError("")
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Edit Outlet">
            <IconPencil className="size-4" stroke={1.75} />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Outlet Details</DialogTitle>
          <DialogDescription>
            Modify outlet settings or link to a different organization.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
          noValidate
        >
          {apiError && <ErrorMsg message={apiError} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-outletName">Outlet Name *</Label>
              <Input
                id="edit-outletName"
                aria-invalid={!!errors.name}
                {...register("name", { required: "Outlet name is required." })}
              />
              <InlineError error={errors.name?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-outletOrg">Organization</Label>
              <NativeSelect
                id="edit-outletOrg"
                className="w-full"
                disabled={orgsLoading}
                {...register("organizationId")}
              >
                <OptionPlaceholder value="" label="None (Standalone)" />
                {orgs
                  .filter(
                    (o) =>
                      !o.deletedAt || (o._id || o.id) === outlet.organizationId
                  )
                  .map((org) => (
                    <NativeSelectOption
                      key={org._id || org.id}
                      value={org._id || org.id}
                    >
                      {org.name} {org.deletedAt ? "(Deleted)" : ""}
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-address">Address *</Label>
            <Input
              id="edit-address"
              aria-invalid={!!errors.address}
              {...register("address", { required: "Address is required." })}
            />
            <InlineError error={errors.address?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-gstin">GSTIN (Optional)</Label>
              <Input
                id="edit-gstin"
                aria-invalid={!!errors.gstin}
                {...register("gstin", {
                  pattern: {
                    value:
                      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                    message: "Invalid GSTIN format.",
                  },
                })}
              />
              <InlineError error={errors.gstin?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-pan">PAN (Optional)</Label>
              <Input
                id="edit-pan"
                aria-invalid={!!errors.pan}
                {...register("pan", {
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: "Invalid PAN format.",
                  },
                })}
              />
              <InlineError error={errors.pan?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-isCustomerapp">Customer App Enabled</Label>
              <NativeSelect
                id="edit-isCustomerapp"
                className="w-full"
                {...register("isCustomerapp")}
              >
                <NativeSelectOption value="false">
                  No (Disabled)
                </NativeSelectOption>
                <NativeSelectOption value="true">
                  Yes (Enabled)
                </NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-status">Status</Label>
              <NativeSelect
                id="edit-status"
                className="w-full"
                {...register("status")}
              >
                <NativeSelectOption value="active">Active</NativeSelectOption>
                <NativeSelectOption value="inactive">
                  Inactive
                </NativeSelectOption>
                <NativeSelectOption value="on hold">On Hold</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-3">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && (
                <IconLoader2 className="size-4 animate-spin" stroke={2} />
              )}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OptionPlaceholder({ value, label }: { value: string; label: string }) {
  return <NativeSelectOption value={value}>{label}</NativeSelectOption>
}
