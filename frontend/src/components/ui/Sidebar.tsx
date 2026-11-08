import { NavLink } from "react-router";

import { useState, useEffect, useCallback } from "react";
import "./Sidebar.css";

import { getDashboards } from "../../service/dashboardService";
import { useInvalidate, useVersion } from "../../context/RefreshContext";
import { useHashModal } from "../modal/useHashModal";

import { FiSettings, FiUser, FiUsers, FiLink, FiPlus } from "react-icons/fi";
import IconButton from "./button/IconButton";
import type { DashboardListItem } from "../../types/dashboards";

export default function Sidebar() {
  const dashboardsVersion = useVersion("dashboards");
  const { open } = useHashModal();
  const invalidate = useInvalidate();

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
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="item">
          <span>⌘</span> CloudCore
        </NavLink>
      </div>

      <div className="sidebar-content">
        <div className="section-title">ADMIN</div>

        <NavLink
          to="/users"
          className={({ isActive }) => `dashboard-item ${isActive ? "active" : ""}`}
        >
          <FiUsers />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/connections"
          className={({ isActive }) => `dashboard-item ${isActive ? "active" : ""}`}
        >
          <FiLink />
          <span>Connections</span>
        </NavLink>

        <div className="section-header">
          <span className="section-title">DASHBOARDS</span>

          <IconButton
            className="icon-btn"
            title="Dodaj nowy pulpit"
            icon={<FiPlus />}
            onClick={() => open("add-dashboard")}
          />
        </div>
        {dashboards.map((item) => (
          <NavLink
            key={item.id}
            to={`/dashboards/${item.id}`}
            className={({ isActive }) => `dashboard-item ${isActive ? "active" : ""}`}
          >
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <FiUser className="avatar-icon" />
          <span className="username">Admin</span>
        </div>
        <IconButton
          className="icon-btn settings-btn"
          title="Ustawienia"
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
