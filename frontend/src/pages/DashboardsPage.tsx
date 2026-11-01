import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getDashboardById,
  updateDashboard,
  deleteDashboard,
} from "../service/dashboardService";
import { getMetricDataPoints } from "../service/metricService";
import { useHashModal } from "../components/modal/useHashModal";

import type { Dashboard } from "../types/dashboards";
import type { MetricDataPoint } from "../types/metrics";

import { FiPlus, FiTrash, FiEdit2, FiCheck, FiX } from "react-icons/fi";

import ChartCard from "../components/charts/ChartCard";

interface DashboardsPageProps {
  version: number;
  refresh: () => void;
}

export default function DashboardsPage({ version, refresh }: DashboardsPageProps) {
  const { id } = useParams<{ id: string }>();
  const { open } = useHashModal();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [series, setSeries] = useState<MetricDataPoint[]>([]);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const loadDashboard = async () => {
    try {
      const fetched = await getDashboardById(id!);
      setDashboard(fetched);

      const metricIds = [
        ...new Set(
          fetched.charts.flatMap((chart) =>
            chart.metrics.map((metric) => metric.id),
          ),
        ),
      ];

      const results = await Promise.all(
        metricIds.map((metricId) => getMetricDataPoints(metricId)),
      );

      setSeries(results.flat());
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [id, version]);

  if (!dashboard) {
    return <div>Dashboard not found: {id}</div>;
  }

  const handleEdit = () => {
    setTitleDraft(dashboard.title);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    const title = titleDraft.trim();
    if (title === "") {
      alert("Title cannot be empty.");
      return;
    }

    if (title === dashboard.title) {
      setIsEditing(false);
      return;
    }

    try {
      const updated = await updateDashboard(dashboard.id, { title });
      setDashboard((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditing(false);
      refresh();
    } catch (error) {
      console.error("Error updating dashboard: ", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;

    try {
      await deleteDashboard(dashboard.id);
      refresh();
      navigate("/");
    } catch (error) {
      console.error("Error deleting dashboard: ", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        {isEditing ? (
          <>
            <input
              value={titleDraft}
              maxLength={100}
              autoFocus
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <button className="icon-btn" title="Save" onClick={handleSave}>
              <FiCheck />
            </button>
            <button className="icon-btn" title="Cancel" onClick={handleCancel}>
              <FiX />
            </button>
          </>
        ) : (
          <>
            <h3>{dashboard.title}</h3>
            <button
              className="icon-btn"
              title="Edit title"
              onClick={handleEdit}
            >
              <FiEdit2 />
            </button>
          </>
        )}

        <p>Utworzono: {dashboard.created_at}</p>
        <p>Ostatnia aktualizacja: {dashboard.updated_at}</p>
        <button
          className="icon-btn"
          title="Delete dashboard"
          onClick={handleDelete}
        >
          <FiTrash />
        </button>
      </div>

      <div className="dashboard-content">
        <div className="section-header">
          <span className="section-title lg">Charts</span>
          <button
            className="icon-btn"
            title="Add new chart"
            onClick={() => open("add-chart", { dashboard_id: String(dashboard.id) })}
          >
            <FiPlus />
          </button>
        </div>

        {dashboard.charts.length === 0 ? (
          <p>No charts yet.</p>
        ) : (
          dashboard.charts.map((chart) => {
            const chartMetricIds = new Set(
              chart.metrics.map((metric) => metric.id),
            );

            const chartSeries = series.filter((point) =>
              chartMetricIds.has(point.metric_definition_id),
            );

            return (
              <ChartCard key={chart.id} chart={chart} series={chartSeries} />
            );
          })
        )}
      </div>
    </div>
  );
}

// +-----------------------------------------------------------------------------------+
// |  AWS EC2 Production                                     [🟢System OK] [🔄 Odśwież] |
// |  ID Pulpitu: 1 | Region: eu-central-1 | Ostatnia aktualizacja: przed chwilą       |
// +-----------------------------------------------------------------------------------+
// |                                                                                   |
// |  +----------------+  +----------------+  +----------------+  +----------------+  |
// |  | ZUŻYCIE CPU    |  | PAMIĘĆ RAM     |  | RUCH SIECIOWY  |  | INSTANCJE      |  |
// |  | 34%            |  | 68% (10.8 GB)  |  | 1.2 GB/s       |  | 12 / 12        |  |
// |  | 📈 +2% vs h.   |  | 📊 Normal      |  | ⬆ 850MB ⬇ 350MB|  | 🟢 Wszystkie OK|  |
// |  +----------------+  +----------------+  +----------------+  +----------------+  |
// |                                                                                   |
// +-----------------------------------------------------------------------------------+
// |                                                                                   |
// |  GŁÓWNY WYKRES OBCIĄŻENIA (CPU & RAM)                                              |
// |  +-----------------------------------------------------------------------------+  |
// |  | 100% |                                                                     |  |
// |  |  50% |       /\         /\_                                                |  |
// |  |   0% |______/  \_______/   \_____________________________________________  |  |
// |  |      00:00    04:00    08:00    12:00    16:00    20:00                    |  |
// |  +-----------------------------------------------------------------------------+  |
// |                                                                                   |
// +-----------------------------------------------------------------------------------+
// |  AKTYWNE INSTANCJE SERWEROWE                                                       |
// |  +---------------------+------------------+------------------+-----------------+  |
// |  | ID Instancji        | Typ              | Status           | Zużycie CPU     |  |
// |  +---------------------+------------------+------------------+-----------------+  |
// |  | i-0a82b9f123        | t3.medium        | 🟢 Działa        | 24%             |  |
// |  | i-0e91c4d987        | t3.large         | 🟢 Działa        | 51%             |  |
// |  | i-0f44a8e221        | t3.small         | 🟡 Wysokie lab.  | 89%             |  |
// |  +---------------------+------------------+------------------+-----------------+  |
// +-----------------------------------------------------------------------------------+
