import React, { useCallback, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  IconUpload,
  IconDownload,
  IconLoader2,
  IconX,
  IconFileTypeCsv,
  IconAlertCircle,
  IconCircleCheckFilled,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useBulkCreateMenuItems } from "@/hooks/useMenuItems"
import {
  type CreateMenuItemDto,
  MenuItemCategory,
  MenuItemStatus,
} from "@/api/menu-items.api"

// ── CSV Column Definition ────────────────────────────────────────────────────
const REQUIRED_COLUMNS = ["name", "description", "category", "price", "stock", "isVeg"] as const

const VALID_CATEGORIES = Object.values(MenuItemCategory)
const VALID_STATUSES = Object.values(MenuItemStatus)

// ── Row Types ────────────────────────────────────────────────────────────────
interface ParsedRow {
  rowIndex: number
  raw: Record<string, string>
  data: CreateMenuItemDto | null
  errors: string[]
}

// ── Quoted-field CSV tokenizer (handles commas inside quoted fields) ─────────
function tokenizeCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      // Escaped double-quote inside a quoted field ("" → ")
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

// ── CSV Parsing ──────────────────────────────────────────────────────────────
function parseCSV(csvText: string, outletId: string): ParsedRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headers = tokenizeCSVLine(lines[0]).map((h) => h.toLowerCase())

  // Check required columns exist in header (case-insensitive — headers are already lowercased)
  const missingCols = REQUIRED_COLUMNS.filter((c) => !headers.includes(c.toLowerCase()))
  if (missingCols.length > 0) {
    throw new Error(
      `CSV is missing required columns: ${missingCols.join(", ")}`
    )
  }

  const rows: ParsedRow[] = []

  lines.slice(1).forEach((line, idx) => {
    const values = tokenizeCSVLine(line)
    const raw: Record<string, string> = {}
    headers.forEach((h, i) => {
      raw[h] = values[i] ?? ""
    })

    // Skip completely blank rows (e.g. trailing newlines)
    if (Object.values(raw).every((v) => v === "")) return

    const errors: string[] = []

    // ── name (required, non-whitespace) ──────────────────────────────────────
    const name = (raw["name"] ?? "").trim()
    if (!name) errors.push("name is required")

    // ── description (required, non-whitespace) ────────────────────────────────
    const description = (raw["description"] ?? "").trim()
    if (!description) errors.push("description is required")

    // ── category (required, strict enum) ─────────────────────────────────────
    const category = (raw["category"] ?? "").trim().toUpperCase() as MenuItemCategory
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(
        `category must be one of: ${VALID_CATEGORIES.join(", ")}`
      )
    }

    // ── price (required, non-negative number) ─────────────────────────────────
    const priceRaw = (raw["price"] ?? "").trim()
    const price = parseFloat(priceRaw)
    if (!priceRaw || isNaN(price) || price < 0) {
      errors.push("price must be a non-negative number (e.g. 250 or 99.99)")
    }

    // ── stock (required, non-negative whole number) ───────────────────────────
    const stockRaw = (raw["stock"] ?? "").trim()
    const stockNum = Number(stockRaw)
    if (
      !stockRaw ||
      isNaN(stockNum) ||
      stockNum < 0 ||
      !Number.isInteger(stockNum)
    ) {
      errors.push("stock must be a non-negative whole number (e.g. 10)")
    }
    const stock = Number.isInteger(stockNum) ? stockNum : 0

    // ── isVeg (required, strictly "true" or "false") ──────────────────────────
    // Note: raw keys are lowercased from headers → "isveg" not "isVeg"
    const isVegRaw = (raw["isveg"] ?? "").trim().toLowerCase()
    if (!["true", "false"].includes(isVegRaw)) {
      errors.push('isVeg must be exactly "true" or "false"')
    }
    const isVeg = isVegRaw === "true"

    // ── isAvailable (optional, strictly "true"/"false" if provided) ───────────
    // Note: raw keys are lowercased from headers → "isavailable" not "isAvailable"
    const isAvailableRaw = (raw["isavailable"] ?? "").trim().toLowerCase()
    if (isAvailableRaw !== "" && !["true", "false"].includes(isAvailableRaw)) {
      errors.push('isAvailable must be "true" or "false" (or leave empty — defaults to true)')
    }
    const isAvailable = isAvailableRaw === "" ? true : isAvailableRaw === "true"

    // ── status (optional, strict enum — error if invalid) ─────────────────────
    const statusRaw = (raw["status"] ?? "").trim().toLowerCase() as MenuItemStatus
    let status: MenuItemStatus
    if (statusRaw === "") {
      status = MenuItemStatus.ACTIVE // default when omitted
    } else if (VALID_STATUSES.includes(statusRaw)) {
      status = statusRaw
    } else {
      errors.push(
        `status must be one of: ${VALID_STATUSES.join(", ")} (or leave empty for default "active")`
      )
      status = MenuItemStatus.ACTIVE
    }

    // ── imageUrl (optional, must be valid URL if provided) ────────────────────
    // Note: raw keys are lowercased from headers → "imageurl" not "imageUrl"
    const imageUrlRaw = (raw["imageurl"] ?? "").trim()
    let imageUrl: string | null = null
    if (imageUrlRaw) {
      try {
        new URL(imageUrlRaw)
        imageUrl = imageUrlRaw
      } catch {
        errors.push("imageUrl must be a valid URL (e.g. https://example.com/image.jpg)")
      }
    }

    const data: CreateMenuItemDto | null =
      errors.length === 0
        ? {
            outletId,
            name,
            description,
            category,
            isVeg,
            price,
            stock,
            isAvailable,
            status,
            imageUrl,
          }
        : null

    rows.push({
      rowIndex: idx + 2, // 1-indexed, row 1 = header
      raw,

      data,
      errors,
    })
  })

  return rows
}

// ── Preview Table ────────────────────────────────────────────────────────────
function PreviewTable({ rows }: { rows: ParsedRow[] }) {
  const validCount = rows.filter((r) => r.errors.length === 0).length
  const invalidCount = rows.length - validCount

  return (
    <div className="flex flex-col gap-2">
      {/* Summary badges */}
      <div className="flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
          <IconCircleCheckFilled className="size-3" />
          {validCount} valid
        </span>
        {invalidCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
            <IconAlertCircle className="size-3" />
            {invalidCount} with errors
          </span>
        )}
      </div>

      {/* Table */}
      <div className="max-h-56 overflow-auto rounded-lg border border-border/60">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Row</th>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Name</th>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Description</th>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Category</th>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Price (₹)</th>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Stock</th>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Veg</th>
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row) => {
              const hasError = row.errors.length > 0
              return (
                <React.Fragment key={row.rowIndex}>
                  <tr
                    className={cn(
                      "transition-colors",
                      hasError
                        ? "bg-rose-50/60 dark:bg-rose-950/10"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <td className="px-2 py-1.5 text-muted-foreground">{row.rowIndex}</td>
                    <td className="px-2 py-1.5 font-medium text-foreground">
                      {row.raw["name"] || <span className="italic text-muted-foreground">—</span>}
                    </td>
                    <td className="max-w-[140px] truncate px-2 py-1.5 text-muted-foreground" title={row.raw["description"]}>
                      {row.raw["description"] || <span className="italic text-muted-foreground">—</span>}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">{row.raw["category"] || "—"}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{row.raw["price"] || "—"}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{row.raw["stock"] || "—"}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {row.raw["isveg"] === "true" ? (
                        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">Veg</span>
                      ) : row.raw["isveg"] === "false" ? (
                        <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">Non-Veg</span>
                      ) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">{row.raw["status"] || "active"}</td>
                  </tr>
                  {hasError && (
                    <tr className="bg-rose-50/40 dark:bg-rose-950/10">
                    <td colSpan={8} className="px-2 pb-1.5 pt-0">
                        <div className="flex flex-col gap-0.5">
                          {row.errors.map((err, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400"
                            >
                              <IconAlertCircle className="size-2.5 shrink-0" />
                              {err}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function BulkUploadMenuItem({
  open,
  onOpenChange,
  lockedOutletId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lockedOutletId: string | null
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  const bulkMutation = useBulkCreateMenuItems()

  const validRows = parsedRows.filter((r) => r.errors.length === 0)
  const canUpload = validRows.length > 0 && !bulkMutation.isPending

  // ── Reset state on close
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setFileName(null)
      setParsedRows([])
      setParseError(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
    onOpenChange(o)
  }

  // ── Process file
  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setParseError("Please upload a valid .csv file.")
        return
      }
      setFileName(file.name)
      setParseError(null)
      setParsedRows([])

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const outletId = lockedOutletId ?? ""
          if (!outletId) {
            setParseError(
              "No outlet detected. Please ensure you are logged in to an outlet."
            )
            return
          }
          const rows = parseCSV(text, outletId)
          if (rows.length === 0) {
            setParseError("No data rows found in the CSV file.")
            return
          }
          setParsedRows(rows)
        } catch (err: any) {
          setParseError(err.message ?? "Failed to parse CSV.")
        }
      }
      reader.readAsText(file)
    },
    [lockedOutletId]
  )

  // ── Drag & Drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  // ── Submit
  const handleUpload = async () => {
    const items = validRows
      .map((r) => r.data)
      .filter((d): d is CreateMenuItemDto => d !== null)

    try {
      const result = await bulkMutation.mutateAsync(items)
      toast.success(
        `Successfully uploaded ${Array.isArray(result) ? result.length : items.length} menu item(s)!`
      )
      handleOpenChange(false)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Bulk upload failed."
      toast.error(msg)
    }
  }

  // ── Download sample CSV
  const handleDownloadSample = () => {
    const link = document.createElement("a")
    link.href = "/sample-menu-items.csv"
    link.download = "sample-menu-items.csv"
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileTypeCsv className="size-5 text-primary" />
            Bulk Upload Menu Items
          </DialogTitle>
          <DialogDescription>
            Download the sample CSV, fill in your menu items, then upload it
            here. Only valid rows will be submitted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Step 1 — Download Sample */}
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border/60 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Step 1 — Download Sample CSV
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Required: name, description, category, price, stock, isVeg &nbsp;·&nbsp; Optional: isAvailable, status, imageUrl
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={handleDownloadSample}
            >
              <IconDownload className="size-3.5" />
              Sample CSV
            </Button>
          </div>

          {/* Step 2 — Upload file */}
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              Step 2 — Upload Filled CSV
            </p>
            <div
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {fileName ? (
                <div className="flex flex-col items-center gap-2">
                  <IconFileTypeCsv className="size-10 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {fileName}
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFileName(null)
                      setParsedRows([])
                      setParseError(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    <IconX className="size-3" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <IconUpload className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Drag & drop your CSV here
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    or click to browse — only .csv files accepted
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
              <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Step 3 — Preview */}
          {parsedRows.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                Step 3 — Review & Upload
              </p>
              <PreviewTable rows={parsedRows} />
              {parsedRows.some((r) => r.errors.length > 0) && (
                <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <IconAlertTriangle className="size-3 shrink-0" />
                  Rows with errors will be skipped. Only {validRows.length}{" "}
                  valid row(s) will be uploaded.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={bulkMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!canUpload}
            className="gap-1.5"
          >
            {bulkMutation.isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <IconUpload className="size-3.5" />
                Upload{validRows.length > 0 ? ` (${validRows.length} items)` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
