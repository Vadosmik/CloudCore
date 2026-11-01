import type { FormEvent } from "react";

// import { createDashboard } from "../../../service/dashboardService";
import type { ModalContentProps } from "../types";
import Button from "../../ui/button/Button";

export default function SettingModal({ close, onChanged }: ModalContentProps) {
  // const [title, setTitle] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!title.trim()) return;

    try {
      // const newDashboard = await createDashboard({ title: title.trim() });
      onChanged();
    } catch (error) {
      console.error("Error save changes:", error);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      setting
      <div className="modal-actions">
        <Button title="Cancel" onClick={close} />
        <Button title="Save" type="submit" className="primary" />
      </div>
    </form>
  );
}
