import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/** Academic year that starts in August, e.g. "2026/2027" (mirrors the backend helper). */
export function currentAcademicYear(now = new Date()) {
  const first = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${first}/${first + 1}`
}
