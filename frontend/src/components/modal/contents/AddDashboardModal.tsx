import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { createDashboard } from "../../../service/dashboardService";
import type { ModalContentProps } from "../types";
import Button from "../../ui/button/Button";
import { Input } from "../../ui/input/Input";

export default function AddDashboardModal({
  close,
  onChanged,
}: ModalContentProps) {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newDashboard = await createDashboard({ title: title.trim() });
      onChanged();
      navigate(`/dashboards/${newDashboard.id}`, { replace: true });
    } catch (error) {
      console.error("Error creating dashboard:", error);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <Input
        label="Dashboard name"
        placeholder="Dashboard name"
        value={title}
        maxLength={100}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        required
      />

      <div className="modal-actions">
        <Button title="Cancel" onClick={close} />
        <Button title="Save" type="submit" className="primary" />
      </div>
    </form>
  );
}
