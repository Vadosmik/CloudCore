import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import "./Input.css";

type SelectorProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string | null;
};

export function Select({
  label,
  children,
  error,
  ...inputProps
}: SelectorProps) {
  const id = useId();

  return (
    <div className={`input-field ${error ? "input-field--error" : ""}`}>
      <label htmlFor={id} className="input-field__label">
        {label}
      </label>

      <select
        id={id}
        className="input-field__control"
        aria-invalid={Boolean(error)}
        {...inputProps}
      >
        {children}
      </select>

      {error && <p className="input-field__error">{error}</p>}
    </div>
  );
}
