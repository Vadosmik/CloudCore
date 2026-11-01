import { useEffect, useRef, type ReactNode } from "react";
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

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-header">
        <span className="section-title lg">{title}</span>
        <IconButton
          className="danger"
          title="Close"
          icon={<FiX />}
          onClick={onClose}
        />
      </div>
      <div className="modal-content">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </dialog>
  );
}
