import { Link, useNavigate } from "react-router";
import "./Button.css";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to, label = "Back", className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  if (to) {
    return (
      <Link to={to} className={`btn btn--link ${className}`}>
        ← {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => navigate(-1)} className={`btn btn--default ${className}`}>
      ← {label}
    </button>
  );
}
