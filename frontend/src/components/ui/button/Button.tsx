import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  className?: string;
  onClick?: () => void;
};

export default function Button({
  title,
  className,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn ${className || ""}`}
      type="button"
      title={title}
      onClick={onClick}
      {...rest}
    >
      {title}
    </button>
  );
}
