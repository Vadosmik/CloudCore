import Modal from "./Modal";
import { useHashModal } from "./useHashModal";
import { modalRegistry } from "./modalRegistry";

export default function ModalHost({ onChanged }: { onChanged: () => void }) {
  const { current, params, close } = useHashModal();
  const entry = current ? modalRegistry[current] : undefined;

  if (!entry) return null;

  const { title, Content } = entry;

  return (
    <Modal open title={title} onClose={close}>
      <Content close={close} params={params} onChanged={onChanged} />
    </Modal>
  );
}