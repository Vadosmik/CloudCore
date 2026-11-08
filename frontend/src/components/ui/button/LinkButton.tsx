import { Link } from "react-router";
import "./Button.css";
import type { ReactNode } from "react";

interface LinkButtonProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export default function LinkButton({ to, children, className = "" }: LinkButtonProps) {
  return (
    <Link to={to} className={`btn btn--link ${className}`}>
      {children}
    </Link>
  );
}
