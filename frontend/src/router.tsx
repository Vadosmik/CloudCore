// import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import App from "./App";

import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/status/ErrorPage";
import UsersPage from "./pages/UsersPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import DashboardsPage from "./pages/Dashboard/DashboardsPage";

// Lazy loading stron (na później), użycie: { path: "/users", lazy: page(() => import("./pages/UsersPage")) }
// const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
//   Component: (await load()).default,
// });

// handle.public  -> strona dostępna bez logowania
// handle.role    -> wymagana rola (sprawdzana w App.tsx, na razie wyłączone)

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <p className="app-loading">Loading...</p>,
    children: [
      { path: "/", element: <HomePage />, handle: { public: true } },
      { path: "/users", element: <UsersPage />, handle: { role: "admin" } },
      { path: "/connections", element: <ConnectionsPage />, handle: { role: "admin" } },
      { path: "/dashboards/:id", element: <DashboardsPage /> },
    ],
  },
]);
