export interface ModalContentProps {
  close: () => void;
  params: URLSearchParams;
  onChanged: () => void;
}