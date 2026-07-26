/* eslint-disable prettier/prettier */
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { type Organization } from "@/api/organizations.api"
import { useCreateOrganization, useUpdateOrganization } from "@/hooks/useOrganizations"
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { IconPlus, IconPencil, IconAlertCircle, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

function InlineError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="flex items-center gap-1 text-[11px] text-destructive mt-1">
      <IconAlertCircle className="size-3 shrink-0" stroke={2} />
      <span>{error}</span>
    </p>
  )
}

interface OrgFormData {
  name: string
}

export function CreateOrgDialog() {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState("")

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrgFormData>({
    defaultValues: {
      name: "",
    }
  })

  const { mutate, isPending } = useCreateOrganization()

  const onSubmit = (data: OrgFormData) => {
    setApiError("")
    mutate(data.name.trim(), {
      onSuccess: () => {
        toast.success("Organization created successfully!")
        setOpen(false)
        reset()
      },
      onError: (err: any) => {
        const msg = err.message || "Failed to create organization."
        setApiError(msg)
        toast.error(msg)
      }
    })
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
          <Button className="gap-1.5">
            <IconPlus className="size-3.5" />
            New Organization
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Add a new organization to the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2" noValidate>
          {apiError && <ErrorMsg message={apiError} />}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-name" className="font-medium text-foreground">
              Organization Name *
            </Label>
            <Input
              id="org-name"
              placeholder="e.g. Spice Garden Group"
              aria-invalid={!!errors.name}
              {...register("name", { required: "Organization name is required." })}
            />
            <InlineError error={errors.name?.message} />
          </div>

          <DialogFooter>
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
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditOrgDialogProps {
  org: Organization
}

export function EditOrgDialog({ org }: EditOrgDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState("")

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrgFormData>({
    defaultValues: {
      name: org.name,
    }
  })

  useEffect(() => {
    if (open) {
      reset({ name: org.name })
    }
  }, [org, open, reset])

  const { mutate, isPending } = useUpdateOrganization()

  const onSubmit = (data: OrgFormData) => {
    setApiError("")
    const nameVal = data.name.trim()
    if (nameVal === org.name) {
      setOpen(false)
      return
    }

    const orgId = org._id || org.id
    mutate(
      { id: orgId, name: nameVal },
      {
        onSuccess: () => {
          toast.success("Organization updated successfully!")
          setOpen(false)
          setApiError("")
        },
        onError: (err: any) => {
          const msg = err.message || "Failed to update organization."
          setApiError(msg)
          toast.error(msg)
        }
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
          <Button variant="ghost" size="icon-sm" aria-label="Edit organization">
            <IconPencil className="size-3.5" stroke={1.75} />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>Update the organization name.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2" noValidate>
          {apiError && <ErrorMsg message={apiError} />}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-org-name" className="font-medium text-foreground">
              Organization Name *
            </Label>
            <Input
              id="edit-org-name"
              aria-invalid={!!errors.name}
              {...register("name", { required: "Organization name is required." })}
            />
            <InlineError error={errors.name?.message} />
          </div>

          <DialogFooter>
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
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
