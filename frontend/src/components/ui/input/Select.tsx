import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import "./Input.css";
import { FiChevronDown } from "react-icons/fi";

type SelectorProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string | null;
};

export function Select({ label, children, error, ...inputProps }: SelectorProps) {
  const id = useId();

  return (
    <div className={`input-field ${error ? "input-field--error" : ""}`}>
      <div className="input-field__box">
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
        <FiChevronDown className="input-field__chevron" aria-hidden />
      </div>

      {error && <p className="input-field__error">{error}</p>}
    </div>
  );
}
