import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import "./Input.css";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ label, ...inputProps }: CheckboxProps) {
  const id = useId();

  return (
    <label htmlFor={id} className="chip">
      <input id={id} type="checkbox" className="chip__control" {...inputProps} />
      <span className="chip__label">{label}</span>
    </label>
  );
}
