import { useLocation, useNavigate } from "react-router";


export function useHashModal() {
  const { hash, pathname, search } = useLocation();
  const navigate = useNavigate();

  const [name, query = ""] = hash.replace(/^#/, "").split("?");
  const params = new URLSearchParams(query);

  const open = (modal: string, p?: Record<string, string>) => {
    const q = p ? `?${new URLSearchParams(p)}` : "";
    navigate({ pathname, search, hash: `#${modal}${q}` });
  };

  const close = () => {
    navigate({ pathname, search, hash: "" }, { replace: true });
  };

  return { current: name || null, params, open, close };
}