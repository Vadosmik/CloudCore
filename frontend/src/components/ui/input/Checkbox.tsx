import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import "./Input.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  variant?: "default" | "chip";
};

export function Checkbox({
  label,
  variant = "default",
  className = "",
  ...inputProps
}: CheckboxProps) {
  const id = useId();

  return (
    <label htmlFor={id} className={`checkbox checkbox--${variant} ${className}`.trim()}>
      <input id={id} type="checkbox" className="checkbox__control" {...inputProps} />
      <span className="checkbox__label">{label}</span>
    </label>
  );
}
