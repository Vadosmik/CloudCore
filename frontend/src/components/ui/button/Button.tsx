import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "default" | "primary" | "link" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  isMuted?: boolean;
}

export default function Button({
  children,
  variant = "default",
  isMuted = false,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, isMuted ? "btn--muted" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
