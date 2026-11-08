import { useEffect, useId, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { FiX } from "react-icons/fi";
import "./Modal.css";
import IconButton from "../ui/button/IconButton";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onDragStart = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    if ((e.target as HTMLElement).closest("button")) return;

    drag.current = { startY: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (ref.current) ref.current.style.transition = "none";
  };

  const onDragMove = (e: PointerEvent<HTMLDivElement>) => {
    const dialog = ref.current;
    if (!drag.current || !dialog) return;

    const dy = Math.max(0, e.clientY - drag.current.startY); // tylko w dół
    drag.current.dy = dy;
    dialog.style.transform = `translateY(${dy}px)`;
  };

  const onDragEnd = () => {
    const dialog = ref.current;
    const state = drag.current;
    drag.current = null;
    if (!dialog || !state) return;

    dialog.style.transition = "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)";

    if (state.dy > dialog.offsetHeight * 0.25) {
      dialog.style.transform = "translateY(100%)";
      dialog.addEventListener(
        "transitionend",
        () => {
          dialog.style.transform = "";
          dialog.style.transition = "";
          onClose();
        },
        { once: true },
      );
    } else {
      dialog.style.transform = "";
    }
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div
        className="modal__header"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
      >
        <h2 id={titleId}>{title}</h2>
        <IconButton title="Close Modal" icon={<FiX />} onClick={onClose} />
      </div>
      <div className="modal__content">{children}</div>
      {footer && <div className="modal__footer">{footer}</div>}
    </dialog>
  );
}
