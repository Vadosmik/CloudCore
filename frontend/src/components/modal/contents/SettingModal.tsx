import { useState, type FormEvent } from "react";

// import { createDashboard } from "../../../service/dashboardService";
import type { ModalContentProps } from "../types";
import Button from "../../ui/button/Button";
import { useInvalidate } from "../../../context/RefreshContext";

export default function SettingModal({ close }: ModalContentProps) {
  // const [title, setTitle] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidate = useInvalidate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      // TODO(user-service): await updateSettings({ ... });
      invalidate("user");
      close();
    } catch (error) {
      console.error("Error save changes:", error);
      setError("Could not save the changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="modal__form" onSubmit={handleSubmit}>
      <p>setting</p>

      {error && <p className="modal__error">{error}</p>}

      <div className="modal__actions">
        <Button onClick={close}>Cancel</Button>
        {/* || !title.trim() */}
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
