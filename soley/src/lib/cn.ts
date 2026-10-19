/** Joins class names, skipping empty values: cn("a", ok && "b"). */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
