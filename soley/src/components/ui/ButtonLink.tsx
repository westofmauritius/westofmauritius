import { Link } from "@/i18n/navigation";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";

/** A link that looks like a button. Takes the same `href` as <Link>. */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props} />
  );
}
