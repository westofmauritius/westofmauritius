import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Accessible form fields: a visible label, an optional hint and an error,
 * all tied to the input with aria-describedby, and aria-invalid when there
 * is an error. Usable in server and client components.
 */

type FieldBase = {
  label: string;
  hint?: string;
  error?: string;
  /** Shown after the label for optional fields, e.g. "(optional)". */
  optionalLabel?: string;
  className?: string;
};

const inputClasses = (invalid: boolean) =>
  cn(
    "mt-1.5 block min-h-12 w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-ink",
    "placeholder:text-ink-muted/70",
    invalid
      ? "border-danger-700"
      : "border-ocean-900/30 hover:border-ocean-900/50",
  );

function Describe({
  hintId,
  errorId,
  hint,
  error,
}: {
  hintId: string;
  errorId: string;
  hint?: string;
  error?: string;
}) {
  return (
    <>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm font-semibold text-danger-700">
          {error}
        </p>
      )}
    </>
  );
}

function useFieldIds(id?: string) {
  const generated = useId();
  const base = id ?? generated;
  return { id: base, hintId: `${base}-hint`, errorId: `${base}-error` };
}

function describedBy(
  ids: { hintId: string; errorId: string },
  hint?: string,
  error?: string,
) {
  return (
    [hint && ids.hintId, error && ids.errorId].filter(Boolean).join(" ") ||
    undefined
  );
}

function LabelText({
  label,
  optionalLabel,
}: Pick<FieldBase, "label" | "optionalLabel">) {
  return (
    <span className="font-semibold">
      {label}
      {optionalLabel && (
        <span className="font-normal text-ink-muted"> {optionalLabel}</span>
      )}
    </span>
  );
}

export function TextField({
  label,
  hint,
  error,
  optionalLabel,
  className,
  id,
  ...input
}: FieldBase & React.InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(id);
  return (
    <div className={className}>
      <label htmlFor={ids.id}>
        <LabelText label={label} optionalLabel={optionalLabel} />
      </label>
      <input
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        className={inputClasses(Boolean(error))}
        {...input}
      />
      <Describe {...ids} hint={hint} error={error} />
    </div>
  );
}

export function TextArea({
  label,
  hint,
  error,
  optionalLabel,
  className,
  id,
  ...input
}: FieldBase & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(id);
  return (
    <div className={className}>
      <label htmlFor={ids.id}>
        <LabelText label={label} optionalLabel={optionalLabel} />
      </label>
      <textarea
        id={ids.id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        className={inputClasses(Boolean(error))}
        {...input}
      />
      <Describe {...ids} hint={hint} error={error} />
    </div>
  );
}

export type Option = { value: string; label: string };

export function SelectField({
  label,
  hint,
  error,
  optionalLabel,
  className,
  id,
  options,
  placeholder,
  ...select
}: FieldBase &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: readonly Option[];
    placeholder?: string;
  }) {
  const ids = useFieldIds(id);
  return (
    <div className={className}>
      <label htmlFor={ids.id}>
        <LabelText label={label} optionalLabel={optionalLabel} />
      </label>
      <select
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        className={inputClasses(Boolean(error))}
        {...select}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Describe {...ids} hint={hint} error={error} />
    </div>
  );
}

/**
 * A group of large radio cards in a fieldset with a legend. Controlled or
 * uncontrolled through the usual `value`/`defaultValue` + `onChange` props.
 */
export function RadioCards({
  legend,
  name,
  options,
  value,
  defaultValue,
  onChange,
  error,
  hint,
  columns = 2,
  required,
  id,
}: {
  /** Set on the first option, so error links can focus the group. */
  id?: string;
  legend: string;
  name: string;
  options: readonly (Option & { description?: string })[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  columns?: 1 | 2 | 3;
  required?: boolean;
}) {
  const ids = useFieldIds(name);
  return (
    <fieldset aria-describedby={describedBy(ids, hint, error)}>
      <legend className="font-semibold">{legend}</legend>
      <Describe {...ids} hint={hint} />
      <div
        className={cn(
          "mt-2 grid gap-2",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
        )}
      >
        {options.map((option, index) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5",
              "has-checked:border-ocean-700 has-checked:bg-ocean-50 has-checked:ring-1 has-checked:ring-ocean-700",
              "has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ocean-600",
              error ? "border-danger-700" : "border-ocean-900/25",
            )}
          >
            <input
              id={index === 0 ? id : undefined}
              type="radio"
              name={name}
              value={option.value}
              className="mt-0.5 shrink-0 focus-visible:outline-none"
              required={required}
              {...(value !== undefined
                ? { checked: value === option.value }
                : { defaultChecked: defaultValue === option.value })}
              onChange={onChange ? () => onChange(option.value) : undefined}
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              {option.description && (
                <span className="block text-sm text-ink-muted">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      <Describe {...ids} error={error} />
    </fieldset>
  );
}

export function Checkbox({
  label,
  hint,
  error,
  className,
  id,
  ...input
}: {
  label: React.ReactNode;
  hint?: string;
  error?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const ids = useFieldIds(id);
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={ids.id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, hint, error)}
          className="mt-1 shrink-0"
          {...input}
        />
        <label htmlFor={ids.id} className="cursor-pointer">
          {label}
        </label>
      </div>
      <div className="pl-8">
        <Describe {...ids} hint={hint} error={error} />
      </div>
    </div>
  );
}

/** Several checkboxes under one legend; submitted as repeated `name` values. */
export function CheckboxGroup({
  legend,
  name,
  options,
  defaultValues = [],
  error,
  hint,
  id,
}: {
  legend: string;
  name: string;
  options: readonly Option[];
  defaultValues?: readonly string[];
  error?: string;
  hint?: string;
  id?: string;
}) {
  const ids = useFieldIds(id ?? name);
  return (
    <fieldset aria-describedby={describedBy(ids, hint, error)}>
      <legend className="font-semibold">{legend}</legend>
      <Describe {...ids} hint={hint} />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option, index) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-ocean-900/20 bg-white px-3 has-checked:border-ocean-700 has-checked:bg-ocean-50"
          >
            <input
              id={index === 0 ? id : undefined}
              type="checkbox"
              name={name}
              value={option.value}
              defaultChecked={defaultValues.includes(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      <Describe {...ids} error={error} />
    </fieldset>
  );
}

export function FileField({
  label,
  hint,
  error,
  optionalLabel,
  className,
  id,
  ...input
}: FieldBase & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const ids = useFieldIds(id);
  return (
    <div className={className}>
      <label htmlFor={ids.id}>
        <LabelText label={label} optionalLabel={optionalLabel} />
      </label>
      <input
        id={ids.id}
        type="file"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        className="mt-1.5 block w-full rounded-xl border border-dashed border-ocean-900/40 bg-white p-3 text-base file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-ocean-100 file:px-4 file:font-semibold file:text-ocean-900"
        {...input}
      />
      <Describe {...ids} hint={hint} error={error} />
    </div>
  );
}
