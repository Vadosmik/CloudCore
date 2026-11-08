import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { createDashboard } from "../../../service/dashboardService";
import type { ModalContentProps } from "../types";
import Button from "../../ui/button/Button";
import { Input } from "../../ui/input/Input";
import { useInvalidate } from "../../../context/RefreshContext";

export default function AddDashboardModal({ close }: ModalContentProps) {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidate = useInvalidate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const newDashboard = await createDashboard({ title: title.trim() });
      invalidate("dashboards");
      navigate(`/dashboards/${newDashboard.id}`, { replace: true });
    } catch (error) {
      console.error("Error creating dashboard:", error);
      setError("Could not creating the dashboard. Try again.");
    } finally {
      setSaving(false);
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

      {error && <p className="modal-error">{error}</p>}

      <div className="modal-actions">
        <Button onClick={close}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving || !title.trim()}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
