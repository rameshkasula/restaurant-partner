import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  IconAlertCircle,
  IconLoader2,
  IconPlus,
  IconPencil,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { useCreatePlan, useUpdatePlan } from "@/hooks/usePlans"
import { type Plan, PlanStatus, PLAN_STATUS_LABELS } from "@/api/plans.api"

// ── Schema ───────────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(80),
  tagline: z.string().min(1, "Tagline is required").max(200),
  monthlyPrice: z.number().min(0, "Must be ≥ 0"),
  yearlyPrice: z.number().min(0, "Must be ≥ 0"),
  maxOutlets: z.number().int().min(1).nullable(),
  maxMenuItems: z.number().int().min(1).nullable(),
  isHighlighted: z.boolean(),
  status: z.nativeEnum(PlanStatus),
  features: z
    .array(z.string().min(1))
    .min(1, "At least one feature is required"),
})

type PlanFormData = z.infer<typeof planSchema>

// ── Inline error ─────────────────────────────────────────────────────────────

function InlineError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
      <IconAlertCircle className="size-3 shrink-0" />
      {error}
    </p>
  )
}

// ── Feature list editor ──────────────────────────────────────────────────────

function FeaturesEditor({
  value,
  onChange,
  error,
}: {
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const trimmed = draft.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setDraft("")
  }

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Features *</Label>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Unlimited outlets"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <IconPlus className="size-3.5" />
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-2">
          {value.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md bg-background px-2.5 py-1.5 text-xs shadow-sm"
            >
              <span className="text-foreground">{f}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <IconX className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <InlineError error={error} />
    </div>
  )
}

// ── Dialog ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: Plan | null
}

export default function CreateEditPlan({ open, onOpenChange, plan }: Props) {
  const isEdit = !!plan
  const [apiError, setApiError] = useState("")

  const createMutation = useCreatePlan()
  const updateMutation = useUpdatePlan()
  const isPending = createMutation.isPending || updateMutation.isPending

  const defaultValues: PlanFormData = {
    name: plan?.name ?? "",
    tagline: plan?.tagline ?? "",
    monthlyPrice: plan?.monthlyPrice ?? 0,
    yearlyPrice: plan?.yearlyPrice ?? 0,
    maxOutlets: plan?.maxOutlets ?? null,
    maxMenuItems: plan?.maxMenuItems ?? null,
    isHighlighted: plan?.isHighlighted ?? false,
    status: plan?.status ?? PlanStatus.ACTIVE,
    features: plan?.features ?? [],
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
      setApiError("")
    }
  }, [open, plan])

  const features = watch("features")
  const isHighlighted = watch("isHighlighted")
  const maxOutlets = watch("maxOutlets")
  const maxMenuItems = watch("maxMenuItems")

  const onSubmit = async (data: PlanFormData) => {
    setApiError("")
    try {
      if (isEdit && plan) {
        await updateMutation.mutateAsync({ id: plan._id, data })
        toast.success("Plan updated successfully!")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Plan created successfully!")
      }
      onOpenChange(false)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        `Failed to ${isEdit ? "update" : "create"} plan.`
      setApiError(msg)
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? (
              <IconPencil className="size-4 text-primary" />
            ) : (
              <IconPlus className="size-4 text-primary" />
            )}
            {isEdit ? "Edit Plan" : "Create New Plan"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this pricing plan."
              : "Define a new subscription plan visible to customers."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          {apiError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {apiError}
            </p>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-name">Plan Name *</Label>
            <Input
              id="plan-name"
              placeholder="e.g. Pro"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            <InlineError error={errors.name?.message} />
          </div>

          {/* Tagline */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-tagline">Tagline *</Label>
            <Input
              id="plan-tagline"
              placeholder="e.g. Built for growing brands and multi-outlet operations."
              {...register("tagline")}
              aria-invalid={!!errors.tagline}
            />
            <InlineError error={errors.tagline?.message} />
          </div>

          {/* Price grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-monthly">Monthly Price (₹) *</Label>
              <Input
                id="plan-monthly"
                type="number"
                step="1"
                min="0"
                placeholder="1999"
                {...register("monthlyPrice", { valueAsNumber: true })}
                aria-invalid={!!errors.monthlyPrice}
              />
              <InlineError error={errors.monthlyPrice?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-yearly">Yearly Price (₹/mo) *</Label>
              <Input
                id="plan-yearly"
                type="number"
                step="1"
                min="0"
                placeholder="1599"
                {...register("yearlyPrice", { valueAsNumber: true })}
                aria-invalid={!!errors.yearlyPrice}
              />
              <InlineError error={errors.yearlyPrice?.message} />
            </div>
          </div>

          {/* Limits grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-outlets">Max Outlets</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="plan-outlets"
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  value={maxOutlets ?? ""}
                  onChange={(e) =>
                    setValue(
                      "maxOutlets",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  disabled={maxOutlets === null}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={maxOutlets === null}
                  onChange={(e) =>
                    setValue("maxOutlets", e.target.checked ? null : 1)
                  }
                />
                Unlimited
              </label>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-menu">Max Menu Items</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="plan-menu"
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={maxMenuItems ?? ""}
                  onChange={(e) =>
                    setValue(
                      "maxMenuItems",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  disabled={maxMenuItems === null}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={maxMenuItems === null}
                  onChange={(e) =>
                    setValue("maxMenuItems", e.target.checked ? null : 50)
                  }
                />
                Unlimited
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-status">Status *</Label>
            <NativeSelect
              id="plan-status"
              {...register("status")}
              className="h-9 w-full text-sm"
            >
              {Object.values(PlanStatus).map((s) => (
                <NativeSelectOption key={s} value={s}>
                  {PLAN_STATUS_LABELS[s]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <InlineError error={errors.status?.message} />
          </div>

          {/* Highlighted toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label
                htmlFor="plan-highlighted"
                className="cursor-pointer font-medium"
              >
                Most Popular / Highlighted
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Adds a "Most Popular" badge and primary ring to this plan on the
                pricing page.
              </p>
            </div>
            <Switch
              id="plan-highlighted"
              checked={isHighlighted}
              onCheckedChange={(v) => setValue("isHighlighted", v)}
              size="sm"
            />
          </div>

          {/* Features */}
          <FeaturesEditor
            value={features}
            onChange={(v) => setValue("features", v)}
            error={
              errors.features?.message ?? (errors.features as any)?.[0]?.message
            }
          />

          <DialogFooter className="mt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <IconLoader2 className="size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
