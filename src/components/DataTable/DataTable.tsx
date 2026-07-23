import React, { useState, useMemo, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react"
import { Pagination } from "./Pagination"
import { useVirtualizer } from "./useVirtualizer"
import { cn } from "@/lib/utils"

export interface ColumnDef<T> {
  header: React.ReactNode
  accessorKey?: keyof T | string
  cell?: (info: { row: T; index: number }) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  loadingCount?: number
  searchable?: boolean
  searchableKeys?: (keyof T | string)[]
  searchPlaceholder?: string
  pagination?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]
  virtualized?: boolean
  rowHeight?: number
  containerMaxHeight?: string
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
  title?: React.ReactNode
  icon?: React.ReactNode
  headerActions?: React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  loadingCount = 5,
  searchable = true,
  searchableKeys,
  searchPlaceholder = "Search...",
  pagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  virtualized = false,
  rowHeight = 52,
  containerMaxHeight = "480px",
  onRowClick,
  emptyState,
  title,
  icon,
  headerActions,
}: DataTableProps<T>) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Sort state
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  )

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Virtualization ref
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 1. Handle sorting toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page on sort
  }

  // 2. Filter & Sort Data
  const processedData = useMemo(() => {
    let result = [...data]

    // Local Search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((row) => {
        const keysToSearch =
          searchableKeys ||
          columns.map((col) => col.accessorKey).filter(Boolean)
        return keysToSearch.some((key) => {
          if (!key) return false
          const val = (row as Record<string, unknown>)[key as string]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
      })
    }

    // Local Sort
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        const valA = (a as Record<string, unknown>)[sortKey]
        const valB = (b as Record<string, unknown>)[sortKey]

        if (valA === valB) return 0
        if (valA === null || valA === undefined) return 1
        if (valB === null || valB === undefined) return -1

        const comparison =
          typeof valA === "number" && typeof valB === "number"
            ? valA - valB
            : String(valA).localeCompare(String(valB), undefined, {
                numeric: true,
                sensitivity: "base",
              })

        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return result
  }, [data, searchQuery, sortKey, sortDirection, searchableKeys, columns])

  // Reset pagination if filtered list size changes
  const totalEntries = processedData.length
  const totalPages = Math.ceil(totalEntries / pageSize)

  // 3. Paginate / Virtualize Data Selection
  const paginatedData = useMemo(() => {
    if (virtualized || !pagination) return processedData
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return processedData.slice(start, end)
  }, [processedData, currentPage, pageSize, pagination, virtualized])

  // Setup virtualization hook
  const { startIndex, endIndex, totalHeight, offsetY } = useVirtualizer({
    itemCount: totalEntries,
    itemHeight: rowHeight,
    containerRef,
    overscan: 5,
  })

  // Render virtualized rows
  const virtualRows = useMemo(() => {
    if (!virtualized) return []
    return processedData.slice(startIndex, endIndex)
  }, [processedData, virtualized, startIndex, endIndex])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return (
        <IconSelector className="size-3 shrink-0 text-muted-foreground/60" />
      )
    }
    return sortDirection === "asc" ? (
      <IconChevronUp className="size-3 shrink-0 text-foreground" />
    ) : (
      <IconChevronDown className="size-3 shrink-0 text-foreground" />
    )
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        {/* ── Table Top Search Bar & Header Actions ── */}
        {(searchable || title || icon || headerActions) && (
          <div className="mb-4 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
            {(title || icon) && (
              <div className="flex items-center gap-2">
                {icon}
                {typeof title === "string" ? (
                  <span className="text-sm font-bold">{title}</span>
                ) : (
                  title
                )}
              </div>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-4">
              {searchable && !loading && (
                <div className="relative w-full max-w-sm sm:w-64">
                  <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder={searchPlaceholder}
                    className="h-9 pl-8"
                  />
                </div>
              )}
              {headerActions}
            </div>
          </div>
        )}

        {/* ── Table Container ── */}
        <div
          ref={virtualized ? containerRef : undefined}
          style={
            virtualized
              ? { maxHeight: containerMaxHeight, overflowY: "auto" }
              : undefined
          }
          className={cn("w-full overflow-x-auto", virtualized && "relative")}
        >
          <Table>
            <TableHeader
              className={cn(
                virtualized && "sticky top-0 z-10 bg-muted/90 backdrop-blur-md"
              )}
            >
              <TableRow className="border-b hover:bg-transparent">
                {columns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      "select-none",
                      col.sortable &&
                        col.accessorKey &&
                        "cursor-pointer hover:bg-muted/20 hover:text-foreground",
                      col.className
                    )}
                    onClick={() => {
                      if (col.sortable && col.accessorKey) {
                        handleSort(col.accessorKey as string)
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      {col.sortable &&
                        col.accessorKey &&
                        renderSortIcon(col.accessorKey as string)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className={cn(virtualized && "relative")}>
              {loading ? (
                // Loading Skeleton State
                Array.from({ length: loadingCount }).map((_, rIdx) => (
                  <TableRow key={`skele-${rIdx}`} className="border-b">
                    {columns.map((_, cIdx) => (
                      <TableCell key={`skele-${rIdx}-${cIdx}`}>
                        <Skeleton className="h-4 w-5/6" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : totalEntries === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 p-4 text-center text-muted-foreground"
                  >
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                        <p className="text-xs font-medium text-foreground">
                          No records found
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : virtualized ? (
                // Virtualized Data Rows
                <>
                  {/* Top spacer */}
                  {offsetY > 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{ height: offsetY, padding: 0 }}
                      />
                    </tr>
                  )}

                  {virtualRows.map((row, index) => {
                    const globalIndex = startIndex + index
                    return (
                      <TableRow
                        key={`vrow-${globalIndex}`}
                        className={cn(
                          "border-b transition-colors hover:bg-muted/30",
                          onRowClick && "cursor-pointer"
                        )}
                        style={{ height: rowHeight }}
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map((col, cIdx) => (
                          <TableCell
                            key={`cell-${globalIndex}-${cIdx}`}
                            className={col.className}
                          >
                            {col.cell
                              ? col.cell({ row, index: globalIndex })
                              : col.accessorKey
                                ? String(
                                    (row as Record<string, unknown>)[
                                      col.accessorKey as string
                                    ] ?? ""
                                  )
                                : null}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}

                  {/* Bottom spacer */}
                  {totalHeight - offsetY - virtualRows.length * rowHeight >
                    0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{
                          height:
                            totalHeight -
                            offsetY -
                            virtualRows.length * rowHeight,
                          padding: 0,
                        }}
                      />
                    </tr>
                  )}
                </>
              ) : (
                // Standard Paginated Rows
                paginatedData.map((row, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index
                  return (
                    <TableRow
                      key={`row-${globalIndex}`}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/30",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((col, cIdx) => (
                        <TableCell
                          key={`cell-${globalIndex}-${cIdx}`}
                          className={col.className}
                        >
                          {col.cell
                            ? col.cell({ row, index: globalIndex })
                            : col.accessorKey
                              ? String(
                                  (row as Record<string, unknown>)[
                                    col.accessorKey as string
                                  ] ?? ""
                                )
                              : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Table Pagination ── */}
        {pagination && !virtualized && !loading && totalEntries > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalEntries={totalEntries}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={pageSizeOptions}
          />
        )}
      </CardContent>
    </Card>
  )
}
