import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import App from "./App";

import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/status/ErrorPage";
import UsersPage from "./pages/UsersPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import DashboardsPage from "./pages/Dashboard/DashboardsPage";

const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <p className="app-loading">Loading...</p>,
    children: [
      { path: "/", element: <HomePage />, handle: { public: true } },
      { path: "/users", element: <UsersPage />, handle: { role: true } },
      { path: "/connections", element: <ConnectionsPage />, handle: { role: true } },
      { path: "/dashboards/:id", element: <DashboardsPage /> },
    ],
  },
]);
