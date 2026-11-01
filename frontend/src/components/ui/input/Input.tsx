import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import "./Input.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export function Input({ label, error, type = "text", ...inputProps }: InputProps) {
  const id = useId();

  return (
    <div className={`input-field ${error ? "input-field--error" : ""}`}>
      <label htmlFor={id} className="input-field__label">
        {label}
      </label>

      <input
        id={id}
        type={type}
        className="input-field__control"
        aria-invalid={Boolean(error)}
        {...inputProps}
      />

      {error && <p className="input-field__error">{error}</p>}
    </div>
  );
}