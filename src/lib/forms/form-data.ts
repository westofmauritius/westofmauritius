import type { FormInput } from "./validation";

/** FormData → plain object; repeated fields (checkbox groups) become lists. */
export function formDataToInput(
  data: FormData,
  listFields: string[] = [],
): FormInput {
  const input: Record<string, string | string[]> = {};
  for (const key of listFields) input[key] = [];
  for (const [key, value] of data.entries()) {
    if (typeof value !== "string") continue;
    const existing = input[key];
    if (existing === undefined) input[key] = value;
    else input[key] = [...[existing].flat(), value];
  }
  return input;
}
