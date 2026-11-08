import { useEffect, useState } from "react";
import { Outlet, useMatches } from "react-router";
import "./App.css";

// import { getTokenPayload } from "./service/token";
import { useDevice } from "./hooks/useMediaQuery";
import { useInvalidate, useVersion } from "./context/RefreshContext";
import { useHashModal } from "./components/modal/useHashModal";

import Sidebar from "./components/ui/Sidebar";
import ModalHost from "./components/modal/ModalHost";

import ForbiddenPage from "./pages/status/ForbiddenPage";

type RouteHandle = {
  public?: boolean;
  role?: string;
};

function App() {
  const device = useDevice();
  const matches = useMatches();
  const { open } = useHashModal();
  const invalidate = useInvalidate();
  useVersion("user");

  const [authChecked, setAuthChecked] = useState(() =>
    Boolean(localStorage.getItem("access_token")),
  );
  // const [sessionCheck, setSessionCheck] = useState<SessionCheck>("idle");

  // useEffect(() => {
  //   if (authChecked) return;
  //   ensureSession().finally(() => {
  //     setAuthChecked(true);
  //     invalidate("user");
  //   });
  // }, []);

  // === ROUTES ===
  const handles = matches.map((m) => m.handle as RouteHandle | undefined);

  const lastHandle = handles.at(-1);
  const isPublic = lastHandle?.public ?? false;
  const requiredRole = lastHandle?.role;

  // === ACCESS ===
  // const payload = getTokenPayload();
  // const isLoggedIn = payload !== null;
  const canView = isPublic; // || isLoggedIn;
  const needsSession = authChecked && !canView;

  const isForbidden = canView && requiredRole !== undefined; // && !payload?.roles?.includes(requiredRole);

  useEffect(() => {
    if (!needsSession) {
      // setSessionCheck("idle");
      return;
    }
    let cancelled = false;
    // setSessionCheck("checking");
    // ensureSession().then((ok) => {
    //   if (cancelled) return;
    //   if (ok) {
    //     setSessionCheck("idle");
    //     invalidate("user");
    //   } else {
    //     setSessionCheck("failed");
    //     open("login");
    //   }
    // });
    return () => {
      cancelled = true;
    };
  }, [needsSession]);

  const layoutClass = ["app-layout", `app-layout--${device}`].filter(Boolean).join(" ");

  if (!authChecked) {
    return <p className="app-loading">Loading...</p>;
  }

  return (
    <div className={layoutClass}>
      <Sidebar />

      <main className="app-content">
        {canView ? (
          isForbidden ? (
            <ForbiddenPage />
          ) : (
            <Outlet />
          )
        ) : (
          <p className="app-loading">Loading...</p>
        )}
        {/*  sessionCheck === "failed" ? ( <div className="login-required">
             <p>You need to log in to see this page.</p>
             <button type="button" onClick={() => open("login")}>
               Log in
             </button>
           </div>) : ( <p className="app-loading">Loading...</p>)} */}
      </main>

      <main className="main-content"></main>
      <ModalHost />
    </div>
  );
}

export default App;
