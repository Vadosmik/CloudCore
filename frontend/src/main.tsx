import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { router } from "./router";
import "./index.css";

import { RefreshProvider } from "./context/RefreshContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RefreshProvider>
      <RouterProvider router={router} />
    </RefreshProvider>
  </StrictMode>,
);
