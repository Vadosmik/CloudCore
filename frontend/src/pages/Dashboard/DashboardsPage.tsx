import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./DashboardsPage.css";

import { getDashboardById, updateDashboard, deleteDashboard } from "../../service/dashboardService";
import { getMetricDataPoints } from "../../service/metricService";
import { useHashModal } from "../../components/modal/useHashModal";

import type { Dashboard } from "../../types/dashboards";
import type { MetricDataPoint } from "../../types/metrics";

import { FiPlus, FiTrash, FiEdit2, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";

import IconButton from "../../components/ui/button/IconButton";
import { Input } from "../../components/ui/input/Input";
import { formatDate, formatRelative } from "../../utils/date";

import { DashboardGrid } from "./DashboardGrid";
import type { TimeRange } from "../../types/charts";
import { TIME_RANGE_MS } from "../../components/charts/chartTheme";

const REFRESH_INTERVAL_MS = 60_000;

export default function DashboardsPage() {
  const { id } = useParams<{ id: string }>();
  const { open } = useHashModal();
  const [notFound, setNotFound] = useState(false);

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [series, setSeries] = useState<MetricDataPoint[]>([]);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // licznik odświeżeń: zmiana = ponowne pobranie danych
  const [tick, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    const timer = setInterval(reload, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const fetched = await getDashboardById(id!);
        if (ignore) return;
        setNotFound(false);
        setDashboard(fetched);

        const rangeByMetric = new Map<number, TimeRange>();

        for (const chart of fetched.charts) {
          for (const metric of chart.metrics) {
            const current = rangeByMetric.get(metric.id);
            if (!current || TIME_RANGE_MS[chart.time_range] > TIME_RANGE_MS[current]) {
              rangeByMetric.set(metric.id, chart.time_range);
            }
          }
        }

        const results = await Promise.all(
          [...rangeByMetric].map(([metricId, range]) => getMetricDataPoints(metricId, range)),
        );
        if (ignore) return;
        setSeries(results.flat());
      } catch (error) {
        if (ignore) return;
        setNotFound(true);
        console.error("Error loading dashboard:", error);
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [id, version, tick]);

  if (notFound) return <div>Dashboard not found: {id}</div>;
  if (!dashboard) return <p>Loading...</p>;

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
    if (!confirm(`Delete dashboard "${dashboard.title}"?`)) return;

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
      <header className="dashboard-header">
        <div className="dashboard-header__top">
          {isEditing ? (
            <div className="dashboard-header__title">
              <Input
                label="Title"
                value={titleDraft}
                maxLength={100}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                autoFocus
              />
              <IconButton
                className="primary"
                title="Save"
                icon={<FiCheck />}
                onClick={handleSave}
              />
              <IconButton title="Cancel" icon={<FiX />} onClick={handleCancel} />
            </div>
          ) : (
            <div className="dashboard-header__title">
              <h3>{dashboard.title}</h3>
              <IconButton title="Edit title" icon={<FiEdit2 />} onClick={handleEdit} />
            </div>
          )}

          <div className="dashboard-header__actions">
            <IconButton title="Refresh data" icon={<FiRefreshCw />} onClick={reload} />
            <IconButton
              className="danger"
              title="Delete dashboard"
              icon={<FiTrash />}
              onClick={handleDelete}
            />
          </div>
        </div>

        <div className="dashboard-header__meta">
          <span>
            <b>Utworzono:</b> {formatDate(dashboard.created_at)}
          </span>
          {/* <span>
            <b>Ostatnia aktualizacja:</b> {formatRelative(dashboard.updated_at)}
          </span> */}
          <span>
            <b>Ostatni pomiar:</b>{" "}
            {series.length > 0
              ? formatRelative(series[series.length - 1].timestamp)
              : "Brak danych"}
          </span>
        </div>
      </header>

      <section className="dashboard-charts">
        <div className="section-header">
          <span className="section-title lg">Charts</span>
          <IconButton
            title="Add new chart"
            icon={<FiPlus />}
            onClick={() => open("add-chart", { dashboard_id: String(dashboard.id) })}
          />
        </div>
        {dashboard.charts.length === 0 ? (
          <p>No charts yet.</p>
        ) : (
          <DashboardGrid dashboardId={dashboard.id} charts={dashboard.charts} series={series} />
        )}
      </section>
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
