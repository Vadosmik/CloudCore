import { useId, useLayoutEffect, useRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import "./Input.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string | null;
};

export function Textarea({ label, error, rows = 4, maxLength, value, ...textareaProps }: TextareaProps) {
  const id = useId();
  const currentLength = typeof value === "string" ? value.length : 0;

  const textbox = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = textbox.current;
    if (!element) return;

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value, rows]);

  return (
    <div className={`input-field ${error ? "input-field--error" : ""}`}>
      <label htmlFor={id} className="input-field__label">
        {label}
      </label>

      <textarea
        id={id}
        ref={textbox}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className="input-field__control"
        aria-invalid={Boolean(error)}
        {...textareaProps}
      />

      {maxLength !== undefined && (
        <span className="input-field__counter">
          {currentLength}/{maxLength}
        </span>
      )}

      {error && <p className="input-field__error">{error}</p>}
    </div>
  );
}