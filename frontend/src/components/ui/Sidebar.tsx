import { NavLink } from "react-router";

import { useState, useEffect, useCallback } from "react";
import "./Sidebar.css";

import { getDashboards } from "../../service/dashboardService";
import { /* useInvalidate, */ useVersion } from "../../context/RefreshContext";
import { useHashModal } from "../modal/useHashModal";

import { FiSettings, FiUser, FiUsers, FiLink, FiPlus } from "react-icons/fi";
import IconButton from "./button/IconButton";
import type { DashboardListItem } from "../../types/dashboards";

interface SidebarProps {
  isOpen?: boolean; // tylko mobile: czy panel jest wysunięty
}

// klasa linku w menu: aktywny link dostaje modyfikator --active
const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `sidebar__item ${isActive ? "sidebar__item--active" : ""}`;

export default function Sidebar({ isOpen = false }: SidebarProps) {
  const dashboardsVersion = useVersion("dashboards");
  const { open } = useHashModal();
  // const invalidate = useInvalidate();

  const [dashboards, setDashboards] = useState<DashboardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadDashboards = useCallback(async () => {
    setLoadError(false);
    try {
      const data = await getDashboards();
      setDashboards(data);
    } catch (err) {
      console.error("Error loading dashboards:", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboards();
  }, [dashboardsVersion, loadDashboards]);

  return (
    <aside id="sidebar" className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <div className="sidebar__header">
        <NavLink to="/" className="sidebar__logo">
          <span>⌘</span> CloudCore
        </NavLink>
      </div>

      <div className="sidebar__content">
        <div className="sidebar__section">
          <span className="sidebar__section-title">Admin</span>
        </div>

        <NavLink
          to="/users"
          className={navItemClass}
        >
          <FiUsers />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/connections"
          className={navItemClass}
        >
          <FiLink />
          <span>Connections</span>
        </NavLink>

        <div className="sidebar__section">
          <span className="sidebar__section-title">Dashboards</span>

          <IconButton
            title="Add dashboard"
            icon={<FiPlus />}
            onClick={() => open("add-dashboard")}
          />
        </div>
        {loading && <p className="sidebar__message">Loading...</p>}
        {loadError && (
          <button type="button" className="sidebar__item" onClick={loadDashboards}>
            <span>Could not load. Retry</span>
          </button>
        )}
        {dashboards.map((item) => (
          <NavLink
            key={item.id}
            to={`/dashboards/${item.id}`}
            className={navItemClass}
          >
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <FiUser className="sidebar__avatar" />
          <span>Admin</span>
        </div>
        <IconButton
          rotateOnHover
          title="Settings"
          icon={<FiSettings />}
          onClick={() => open("setting")}
        />
      </div>
    </aside>
  );
}

// ┌──────────────────────────────┬──────────────────────────────────────────────────────────────┐
// │ CloudeCore                   │  📊 Produkcja (CPU & RAM)                       [ Odśwież 🔄]│
// │ ───────────────────────────  ├──────────────────────────────────────────────────────────────┤
// │  DASHBOARDS                  │                                                              │
// │                              │  ┌──────────────────────────┐    ┌──────────────────────────┐│
// │  📊 Produkcja (CPU & RAM)    │  │ AWS EC2 - CPU Usage      │    │ AWS EC2 - RAM Usage      ││
// │  📊 Bazy Danych GCP          │  │  100%|                   │    │  100%|                   ││
// │  📊 Rachunki AWS             │  │   50%|   /~\             │    │   50%|   /---\           ││
// │                              │  │    0%|__/   \________    │    │    0%|__/     \________  ││
// │                              │  └──────────────────────────┘    └──────────────────────────┘│
// │                              │                                                              │
// │                              │  ┌──────────────────────────┐    ┌──────────────────────────┐│
// │                              │  │ GCP PostgreSQL Ops/s     │    │ Network I/O (MB/s)       ││
// │                              │  │  100%|                   │    │  100%|                   ││
// │                              │  │   50%|  /\_/\            │    │   50%|   /\              ││
// │                              │  │    0%|_/     \_______    │    │    0%|__/  \_____________││
// │                              │  └──────────────────────────┘    └──────────────────────────┘│
// │ ───────────────────────────  │                                                              │
// │ [👤 Admin]               ⚙️  │                                                              │
// └──────────────────────────────┴──────────────────────────────────────────────────────────────┘
