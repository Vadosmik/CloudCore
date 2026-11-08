import { useEffect, useState } from "react";
import { Outlet, useLocation /*, useMatches */ } from "react-router";
import "./App.css";

// import { getTokenPayload } from "./service/token";
// import { ensureSession } from "./service/api";
import { useDevice } from "./hooks/useMediaQuery";
// import { useInvalidate, useVersion } from "./context/RefreshContext";
// import { useHashModal } from "./components/modal/useHashModal";

import Sidebar from "./components/ui/Sidebar";
import TopBar from "./components/ui/TopBar";
import ModalHost from "./components/modal/ModalHost";

// import ForbiddenPage from "./pages/status/ForbiddenPage";

// TODO(user-service): odkomentować całą logikę dostępu, gdy będzie user-service.
// type RouteHandle = {
//   public?: boolean;
//   role?: string;
// };
// type SessionCheck = "idle" | "checking" | "failed";

function App() {
  const device = useDevice();
  const location = useLocation();
  // const matches = useMatches();

  // === MOBILE NAV (wysuwany sidebar) ===
  const [navOpen, setNavOpen] = useState(false);
  const isMobile = device === "mobile";

  // zamknij panel po przejściu na inną stronę albo otwarciu modala (#hash)
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.hash]);

  // zamknij panel klawiszem Esc
  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);
  // const { open } = useHashModal();
  // const invalidate = useInvalidate();
  // useVersion("user");

  // const [authChecked, setAuthChecked] = useState(() =>
  //   Boolean(localStorage.getItem("access_token")),
  // );
  // const [sessionCheck, setSessionCheck] = useState<SessionCheck>("idle");

  // useEffect(() => {
  //   if (authChecked) return;
  //   ensureSession().finally(() => {
  //     setAuthChecked(true);
  //     invalidate("user");
  //   });
  // }, []);

  // === ROUTES ===
  // const handles = matches.map((m) => m.handle as RouteHandle | undefined);
  // const lastHandle = handles.at(-1);
  // const isPublic = lastHandle?.public ?? false;
  // const requiredRole = lastHandle?.role;

  // === ACCESS ===
  // const payload = getTokenPayload();
  // const isLoggedIn = payload !== null;
  // const canView = isPublic || isLoggedIn;
  // const needsSession = authChecked && !canView;
  // const isForbidden =
  //   canView && requiredRole !== undefined && !payload?.roles?.includes(requiredRole);

  // useEffect(() => {
  //   if (!needsSession) {
  //     setSessionCheck("idle");
  //     return;
  //   }
  //   let cancelled = false;
  //   setSessionCheck("checking");
  //   ensureSession().then((ok) => {
  //     if (cancelled) return;
  //     if (ok) {
  //       setSessionCheck("idle");
  //       invalidate("user");
  //     } else {
  //       setSessionCheck("failed");
  //       open("login");
  //     }
  //   });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [needsSession]);

  const layoutClass = ["app-layout", `app-layout--${device}`].join(" ");

  // if (!authChecked) {
  //   return <p className="app-loading">Loading...</p>;
  // }

  return (
    <div className={layoutClass}>
      {isMobile && <TopBar navOpen={navOpen} onToggleNav={() => setNavOpen((v) => !v)} />}

      <Sidebar isOpen={isMobile && navOpen} />

      {isMobile && navOpen && (
        <div className="sidebar__backdrop" onClick={() => setNavOpen(false)} aria-hidden />
      )}

      <main className="app-content">
        <Outlet />
        {/* TODO(user-service): zamiast samego <Outlet /> powyżej:
        {canView ? (
          isForbidden ? (
            <ForbiddenPage />
          ) : (
            <Outlet />
          )
        ) : sessionCheck === "failed" ? (
          <div className="page__message">
            <p>You need to log in to see this page.</p>
            <button type="button" onClick={() => open("login")}>
              Log in
            </button>
          </div>
        ) : (
          <p className="app-loading">Loading...</p>
        )} */}
      </main>

      <ModalHost />
    </div>
  );
}

export default App;
