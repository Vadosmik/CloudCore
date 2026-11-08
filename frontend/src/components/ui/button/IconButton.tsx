import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";
import type { ButtonVariant } from "./Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  title: string;
  variant?: ButtonVariant;
  isRound?: boolean;
  rotateOnHover?: boolean;
}

export default function IconButton({
  icon,
  title,
  variant = "default",
  isRound = false,
  rotateOnHover = false,
  className = "",
  type = "button",
  ...rest
}: IconButtonProps) {
  const classes = [
    "btn",
    "btn--icon",
    variant ? `btn--${variant}` : "",
    isRound ? "btn--round" : "",
    rotateOnHover ? "btn--rotate-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} title={title} aria-label={title} {...rest}>
      {icon}
    </button>
  );
}
