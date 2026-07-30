/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  type ColumnDef as TanStackColumnDef,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconSelector,
  IconAdjustmentsHorizontal,
  IconChevronUp,
} from "@tabler/icons-react"

// Extend the column def to support legacy className and cell signature
export type ColumnDef<T> = Omit<TanStackColumnDef<T, any>, "cell"> & {
  header: React.ReactNode
  accessorKey?: keyof T | string
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  emptyText?: string

  // Optional controlled states
  sorting?: SortingState
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>

  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void

  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: React.Dispatch<
    React.SetStateAction<VisibilityState>
  >

  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >

  pagination?: PaginationState
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>
  pageCount?: number

  // Features toggles
  showSearch?: boolean
  showVisibilityToggle?: boolean
  showPagination?: boolean

  // Virtualization config
  maxHeight?: string
}

export function DataTable<T>({
  data,
  columns,
  emptyText = "No data available",
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange: controlledOnGlobalFilterChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange: controlledOnColumnVisibilityChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  pageCount,
  showSearch = true,
  showVisibilityToggle = true,
  showPagination = true,
  maxHeight = "550px",
}: DataTableProps<T>) {
  // Local states for uncontrolled usage
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("")
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = React.useState({})
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })

  // Unified state management (controlled vs uncontrolled)
  const sorting = controlledSorting ?? internalSorting
  const onSortingChange = controlledOnSortingChange ?? setInternalSorting
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter
  const onGlobalFilterChange =
    controlledOnGlobalFilterChange ?? setInternalGlobalFilter
  const columnVisibility =
    controlledColumnVisibility ?? internalColumnVisibility
  const onColumnVisibilityChange =
    controlledOnColumnVisibilityChange ?? setInternalColumnVisibility
  const rowSelection = controlledRowSelection ?? internalRowSelection
  const onRowSelectionChange =
    controlledOnRowSelectionChange ?? setInternalRowSelection
  const pagination = controlledPagination ?? internalPagination
  const onPaginationChange =
    controlledOnPaginationChange ?? setInternalPagination

  // Internal state to hold fast search value before debounce
  const [searchValue, setSearchValue] = React.useState(globalFilter)

  // Sync internal search value with controlled globalFilter
  React.useEffect(() => {
    setSearchValue(globalFilter)
  }, [globalFilter])

  // Debounce the input change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== globalFilter && onGlobalFilterChange) {
        onGlobalFilterChange(searchValue)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, onGlobalFilterChange, globalFilter])

  // Adapt columns to TanStack format
  const adaptedColumns = React.useMemo(() => {
    return columns.map((col) => {
      const adapted = { ...col } as any

      // Bridge the cell signature cell(row) -> TanStack's cell({ row })
      if (col.cell) {
        adapted.cell = (info: any) => col.cell!(info.row.original)
      } else if (col.accessorKey) {
        adapted.cell = (info: any) => {
          const val = info.getValue()
          return typeof val === "string" ||
            typeof val === "number" ||
            typeof val === "boolean"
            ? String(val)
            : (val as unknown as React.ReactNode)
        }
      }

      return adapted
    })
  }, [columns])

  const table = useReactTable({
    data,
    columns: adaptedColumns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    onPaginationChange,
    pageCount: pageCount ?? -1,
    manualPagination: pageCount !== undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Virtualization references and hooks
  const parentRef = React.useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // estimated row height
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0

  // Numbered Pagination Helpers
  const currentPage = pagination.pageIndex + 1
  const totalPages = table.getPageCount()

  const getPageNumbers = React.useCallback(() => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        end = 4
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      if (start > 2) {
        pages.push("ellipsis-start")
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-end")
      }

      pages.push(totalPages)
    }
    return pages
  }, [currentPage, totalPages])

  return (
    <div className="space-y-4">
      {/* Table Toolbar (Aligned strictly to the right) */}
      {(showSearch || showVisibilityToggle) && (
        <div className="flex w-full items-center justify-end gap-3">
          {showSearch && (
            <div className="relative w-full max-w-xs">
              <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-8 rounded-lg pl-9 text-xs"
              />
            </div>
          )}
          {showVisibilityToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-xs font-medium shadow-sm select-none hover:bg-accent hover:text-accent-foreground">
                <IconAdjustmentsHorizontal className="h-4 w-4" />
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="text-xs capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Main Scrollable Table with Virtualization */}
      <div
        ref={parentRef}
        style={{ maxHeight }}
        className="relative overflow-auto rounded-xl border border-border bg-card shadow-sm"
      >
        <Table className="w-full border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.1)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => {
                  const colDef = header.column.columnDef as any
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        colDef.className,
                        "h-11 font-semibold text-muted-foreground"
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            header.column.getCanSort() &&
                              "cursor-pointer transition-colors select-none hover:text-foreground"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="opacity-70">
                              {{
                                asc: <IconChevronUp className="h-3.5 w-3.5" />,
                                desc: (
                                  <IconChevronDown className="h-3.5 w-3.5" />
                                ),
                              }[header.column.getIsSorted() as string] ?? (
                                <IconSelector className="h-3.5 w-3.5 text-muted-foreground/40" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {virtualRows.length > 0 ? (
              <>
                {paddingTop > 0 && (
                  <TableRow
                    style={{ height: `${paddingTop}px` }}
                    className="border-none hover:bg-transparent"
                  >
                    <TableCell
                      colSpan={columns.length}
                      className="border-none p-0"
                    />
                  </TableRow>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index]
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="h-[48px] border-b border-border/50 hover:bg-muted/20"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const colDef = cell.column.columnDef as any
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(colDef.className, "py-3")}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
                {paddingBottom > 0 && (
                  <TableRow
                    style={{ height: `${paddingBottom}px` }}
                    className="border-none hover:bg-transparent"
                  >
                    <TableCell
                      colSpan={columns.length}
                      className="border-none p-0"
                    />
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex flex-col items-center justify-between gap-4 py-2 text-xs sm:flex-row">
          <div className="text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rows per page</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                  table.setPageIndex(0) // Move to Page 1 on page size change
                }}
                className="h-8 w-16 cursor-pointer rounded-lg border border-input bg-card px-2 text-xs shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-8 w-8 rounded-lg p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((pageNum, idx) => {
                if (typeof pageNum === "string") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-muted-foreground select-none"
                    >
                      ...
                    </span>
                  )
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    className={cn(
                      "h-8 w-8 rounded-lg p-0 text-xs",
                      currentPage === pageNum && "pointer-events-none"
                    )}
                    onClick={() => table.setPageIndex(pageNum - 1)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                className="h-8 w-8 rounded-lg p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
