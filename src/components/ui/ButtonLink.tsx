import { Link } from "@/i18n/Link";
import { buttonClass, type Variant } from "./Button";

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
};

/** A link that looks like a button (server components). Most "buttons" on a content site are links. */
export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
