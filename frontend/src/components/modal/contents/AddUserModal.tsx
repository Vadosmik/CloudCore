import { useState, type FormEvent } from "react";
import Button from "../../ui/button/Button";

// import { create } from "../../../service/";
import type { ModalContentProps } from "../types";
import { useInvalidate } from "../../../context/RefreshContext";

export default function AddUserModal({ close }: ModalContentProps) {
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
      // TODO(user-service): await createUser({ ... });
      invalidate("users");
      close();
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Could not add the user. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="modal__form" onSubmit={handleSubmit}>
      {/* <input
        placeholder="Dashboard name"
        value={title}
        maxLength={100}
        autoFocus
        required
        onChange={e => setTitle(e.target.value)}
      /> */}

      <p>Add a new user</p>

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
