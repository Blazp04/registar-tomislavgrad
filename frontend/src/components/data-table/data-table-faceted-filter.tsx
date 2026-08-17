import { useMemo, useState } from "react"
import { CheckIcon, CircleXIcon, PlusCircleIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface FacetedFilterOption {
  label: string
  value: string
}

interface DataTableFacetedFilterProps {
  title: string
  options: FacetedFilterOption[]
  value?: string
  onValueChange: (value?: string) => void
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
}

export function DataTableFacetedFilter({
  title,
  options,
  value,
  onValueChange,
  searchPlaceholder = "Pretraži...",
  emptyMessage = "Nema rezultata.",
  disabled = false,
}: DataTableFacetedFilterProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const selectedOption = options.find((option) => option.value === value)
  const normalizedQuery = query.trim().toLocaleLowerCase("hr")
  const filteredOptions = useMemo(
    () =>
      normalizedQuery
        ? options.filter((option) =>
            option.label.toLocaleLowerCase("hr").includes(normalizedQuery),
          )
        : options,
    [normalizedQuery, options],
  )

  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setQuery("")
  }

  const clearValue = () => {
    onValueChange(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      {value ? (
        <div className="inline-flex h-8 max-w-full items-center rounded-lg border border-dashed bg-background transition-colors hover:bg-muted focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <button
            type="button"
            aria-label={`Ukloni filtar ${title}`}
            className="flex h-full w-8 shrink-0 items-center justify-center rounded-l-lg text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
            onClick={clearValue}
          >
            <CircleXIcon className="size-4" />
          </button>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-full min-w-0 items-center gap-1.5 rounded-r-lg pr-2 text-sm font-normal outline-none disabled:pointer-events-none disabled:opacity-50"
              disabled={disabled}
            >
              <span>{title}</span>
              {selectedOption && (
                <>
                  <Separator orientation="vertical" className="mx-0.5 h-4" />
                  <Badge
                    variant="secondary"
                    className="max-w-44 rounded-sm px-1.5 font-normal"
                  >
                    <span className="truncate">{selectedOption.label}</span>
                  </Badge>
                </>
              )}
            </button>
          </PopoverTrigger>
        </div>
      ) : (
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="max-w-full border-dashed font-normal"
            disabled={disabled}
          >
            <PlusCircleIcon className="text-muted-foreground" />
            <span>{title}</span>
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent className="w-64 p-0" align="start">
        <div className="relative border-b p-2">
          <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={`Pretraži opcije filtra ${title}`}
            className="h-8 w-full bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {filteredOptions.length ? (
            filteredOptions.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                  onClick={() => {
                    onValueChange(isSelected ? undefined : option.value)
                    setOpen(false)
                  }}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input text-transparent",
                    )}
                  >
                    <CheckIcon className="size-3" />
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              )
            })
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
        </div>
        {value && (
          <div className="border-t p-1">
            <button
              type="button"
              className="w-full rounded-md px-2 py-1.5 text-center text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent"
              onClick={clearValue}
            >
              Ukloni filtar
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
