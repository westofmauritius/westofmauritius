/**
 * Joins class names and skips empty values, so components can write
 * `cn("base", isActive && "active", className)`.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
