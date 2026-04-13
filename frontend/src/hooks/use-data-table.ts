import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "react-router"

interface UseDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  pageCount: number
  defaultPerPage?: number
}

export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  defaultPerPage = 20,
}: UseDataTableProps<TData>) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read from URL
  const page = Number(searchParams.get("page") ?? "1")
  const perPage = Number(searchParams.get("limit") ?? String(defaultPerPage))
  const sortParam = searchParams.get("sort")
  const orderParam = searchParams.get("order") as "asc" | "desc" | null

  // Local state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Pagination from URL
  const pagination: PaginationState = useMemo(() => ({
    pageIndex: page - 1,
    pageSize: perPage,
  }), [page, perPage])

  // Sorting from URL
  const sorting: SortingState = useMemo(() => {
    if (!sortParam) return []
    return [{ id: sortParam, desc: orderParam === "desc" }]
  }, [sortParam, orderParam])

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === undefined) {
            next.delete(key)
          } else {
            next.set(key, value)
          }
        }
        return next
      }, { replace: true })
    },
    [setSearchParams],
  )

  const onPaginationChange = useCallback(
    (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue
      updateSearchParams({
        page: String(newPagination.pageIndex + 1),
        limit: String(newPagination.pageSize),
      })
    },
    [pagination, updateSearchParams],
  )

  const onSortingChange = useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue
      if (newSorting.length === 0) {
        updateSearchParams({ sort: null, order: null })
      } else {
        updateSearchParams({
          sort: newSorting[0]!.id,
          order: newSorting[0]!.desc ? "desc" : "asc",
          page: "1",
        })
      }
    },
    [sorting, updateSearchParams],
  )

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: onPaginationChange as any,
    onSortingChange: onSortingChange as any,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  return { table, searchParams, updateSearchParams }
}
