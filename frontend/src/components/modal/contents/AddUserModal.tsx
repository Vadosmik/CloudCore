import { useState, type FormEvent } from "react";
import Button from "../../ui/button/Button";

// import { create } from "../../../service/";
import type { ModalContentProps } from "../types";
import { useInvalidate } from "../../../context/RefreshContext";

export default function AddUserModal({ close }: ModalContentProps) {
  // const [title, setTitle] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!title.trim()) return;

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const invalidate = useInvalidate();

    try {
      // const newDashboard = await createDashboard({ title: title.trim() });
      invalidate("users");
    } catch (error) {
      console.error("Error add chart:", error);
      setError("Could not add the chart. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      {/* <input
        placeholder="Dashboard name"
        value={title}
        maxLength={100}
        autoFocus
        required
        onChange={e => setTitle(e.target.value)}
      /> */}

      <p>doadj nowego uzytkownika</p>

      {error && <p className="modal-error">{error}</p>}

      <div className="modal-actions">
        <Button onClick={close}>Cancel</Button>
        {/* || !title.trim() */}
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
