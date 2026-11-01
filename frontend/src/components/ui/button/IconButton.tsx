import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  title: string;
  className?: string;
  onClick: () => void;
};

export default function IconButton({
  icon,
  title,
  className,
  onClick,
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={`btn ${className || ""}`}
      type="button"
      title={title}
      onClick={onClick}
      {...rest}
    >
      {icon}
    </button>
  );
}
