import { useState } from "react"
import { useUpdateRequest, useCreateRequest } from "@/hooks/useRequests"
import { type RestaurantRequest } from "@/api/requests.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { IconEdit, IconPlus, IconAlertCircle } from "@tabler/icons-react"
import { toast } from "sonner"
import { APP_NAME } from "@/utils/constants"

// ─── Small Helper for Error Alert ────────────────────────────────────────────
export function ErrorMsg({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="my-2">
      <IconAlertCircle className="size-4" stroke={2} />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

// ─── Edit Dialog Component ───────────────────────────────────────────────────
interface EditRequestDialogProps {
  request: RestaurantRequest
}

export function EditRequestDialog({ request }: EditRequestDialogProps) {
  const { mutateAsync: updateRequest, isPending } = useUpdateRequest()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(request.name)
  const [email, setEmail] = useState(request.email)
  const [phone, setPhone] = useState(request.phone)
  const [restaurantName, setRestaurantName] = useState(request.restaurantName)
  const [city, setCity] = useState(request.city || "")
  const [state, setState] = useState(request.state || "")
  const [message, setMessage] = useState(request.message || "")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !restaurantName.trim()
    ) {
      setError("Please fill in all required fields.")
      return
    }
    try {
      await updateRequest({
        id: request._id,
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          restaurantName: restaurantName.trim(),
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          message: message.trim() || undefined,
        },
      })
      toast.success("Request updated successfully!")
      setOpen(false)
    } catch (err: unknown) {
      setError("Failed to update request. Please make sure inputs are valid.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setName(request.name)
          setEmail(request.email)
          setPhone(request.phone)
          setRestaurantName(request.restaurantName)
          setCity(request.city || "")
          setState(request.state || "")
          setMessage(request.message || "")
          setError("")
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Edit Request">
            <IconEdit className="size-4" stroke={1.75} />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Request Details</DialogTitle>
          <DialogDescription>
            Modify details for {request.restaurantName}'s early access request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {error && <ErrorMsg message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-restaurantName">Restaurant Name *</Label>
              <Input
                id="edit-restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Contact Person *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-state">State</Label>
              <Input
                id="edit-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-message">Message / Notes</Label>
            <Input
              id="edit-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional message from partner"
            />
          </div>

          <DialogFooter className="mt-4">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create Dialog Component ─────────────────────────────────────────────────
export function CreateRequestDialog() {
  const { mutateAsync: createRequest, isPending } = useCreateRequest()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !restaurantName.trim()
    ) {
      setError("Please fill in all required fields.")
      return
    }
    try {
      await createRequest({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        restaurantName: restaurantName.trim(),
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        message: message.trim() || undefined,
      })
      toast.success("Request created successfully!")
      setOpen(false)
      // Reset form
      setName("")
      setEmail("")
      setPhone("")
      setRestaurantName("")
      setCity("")
      setState("")
      setMessage("")
    } catch (err: unknown) {
      setError("Failed to create request. Please make sure inputs are valid.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setName("")
          setEmail("")
          setPhone("")
          setRestaurantName("")
          setCity("")
          setState("")
          setMessage("")
          setError("")
        }
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" className="flex items-center gap-1.5">
            <IconPlus className="size-4" stroke={2} />
            <span>Create Request</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Submit details to request early access for {APP_NAME}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {error && <ErrorMsg message={error} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-restaurantName">Restaurant Name *</Label>
              <Input
                id="create-restaurantName"
                placeholder="e.g. Pizza Palace"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-name">Contact Person *</Label>
              <Input
                id="create-name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-email">Email Address *</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-phone">Phone Number *</Label>
              <Input
                id="create-phone"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-city">City</Label>
              <Input
                id="create-city"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-state">State</Label>
              <Input
                id="create-state"
                placeholder="e.g. Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-message">Message / Notes</Label>
            <Input
              id="create-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional message or special request"
            />
          </div>

          <DialogFooter className="mt-4">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isPending}>
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
