import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import "./Input.css";

import { FiEye, FiEyeOff } from "react-icons/fi";
import IconButton from "../button/IconButton";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export function Input({ label, error, type = "text", className = "", ...inputProps }: InputProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`input-field ${error ? "input-field--error" : ""} ${className}`.trim()}>
      <div className="input-field__box">
        <label htmlFor={id} className="input-field__label">
          {label}
        </label>

        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          className="input-field__control"
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        {isPassword && (
          <IconButton
            icon={visible ? <FiEyeOff /> : <FiEye />}
            title={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
            className="input-field__toggle"
          />
        )}
      </div>

      {error && <p className="input-field__error">{error}</p>}
    </div>
  );
}
