import type { FormEvent } from "react";
import Button from "../../ui/button/Button";

// import { create } from "../../../service/";
import type { ModalContentProps } from "../types";

export default function AddUserModal({ close, onChanged }: ModalContentProps) {
  // const [title, setTitle] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!title.trim()) return;

    try {
      // const newDashboard = await createDashboard({ title: title.trim() });
      onChanged();
    } catch (error) {
      console.error("Error add chart:", error);
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
      doadj nowego uzytkownika
      <div className="modal-actions">
        <Button title="Cancel" onClick={close} />
        <Button
          title="Save"
          type="submit"
          className="primary"
          onClick={() => alert("save")}
        />
      </div>
    </form>
  );
}
