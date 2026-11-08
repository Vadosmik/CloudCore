import { useEffect, useState, type FormEvent } from "react";

import { createChart, deleteChart, getChart, updateChart } from "../../../service/chartService";
import { getResources } from "../../../service/resourceService";
import { getMetricDefinitions } from "../../../service/metricService";
import type { Resource } from "../../../types/resources";
import type { MetricDefinition } from "../../../types/metrics";
import type { ChartType, TimeRange } from "../../../types/charts";
import type { ModalContentProps } from "../types";
import { TIME_RANGE_LABELS } from "../../charts/chartTheme";
import Button from "../../ui/button/Button";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/input/Select";
import { Checkbox } from "../../ui/input/Checkbox";
import { useInvalidate } from "../../../context/RefreshContext";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "gauge", label: "Gauge" },
];

export default function ChartFormModal({ close, params }: ModalContentProps) {
  const chartId = params.get("chart_id");
  const isEdit = chartId !== null;
  const dashboardId = Number(params.get("dashboard_id"));

  const [title, setTitle] = useState("");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [timeRange, setTimeRange] = useState<TimeRange>("1h");
  const [metricIds, setMetricIds] = useState<number[]>([]);
  const [resourceId, setResourceId] = useState<number | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidate = useInvalidate();

  useEffect(() => {
    getResources()
      .then(setResources)
      .catch((error) => {
        console.error("Error loading resources:", error);
        setError("Could not loading the resources. Try again.");
      });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getChart(Number(chartId))
      .then((chart) => {
        setTitle(chart.title);
        setChartType(chart.chart_type);
        setTimeRange(chart.time_range);
        setMetricIds(chart.metrics.map((m) => m.id));
        setResourceId(chart.metrics[0]?.resource_id ?? null);
      })
      .catch((error) => {
        console.error("Error loading chart:", error);
        setError("Could not loading the chart. Try again.");
      });
  }, [chartId]);

  useEffect(() => {
    if (resourceId === null) return;

    getMetricDefinitions(resourceId)
      .then(setMetrics)
      .catch((error) => {
        console.error("Error loading metrics:", error);
        setError("Could not loading the metrics. Try again.");
      });
  }, [resourceId]);

  const selectedMetrics = metrics.filter((m) => metricIds.includes(m.id));
  const currentUnitType = selectedMetrics[0]?.unit;

  const toggleMetric = (metric: MetricDefinition) => {
    const isSelected = metricIds.includes(metric.id);

    if (isSelected) {
      setMetricIds((prev) => prev.filter((id) => id !== metric.id));
    } else {
      if (currentUnitType && metric.unit !== currentUnitType) {
        return;
      }
      setMetricIds((prev) => [...prev, metric.id]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || metricIds.length === 0) return;
    if (!isEdit && !dashboardId) return;

    const data = {
      title: title.trim(),
      chart_type: chartType,
      time_range: timeRange,
      metric_ids: metricIds,
    };

    try {
      if (isEdit) {
        await updateChart(Number(chartId), data);
      } else {
        await createChart({ dashboard_id: dashboardId, ...data });
      }
      invalidate("charts");
      close();
    } catch (error) {
      console.error("Error adding chart:", error);
      setError("Could not adding the chart. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete chart "${title}"?`)) return;

    try {
      await deleteChart(Number(chartId));
      invalidate("charts");
      close();
    } catch (error) {
      console.error("Error deleting chart: ", error);
      setError("Could not deleting the chart. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <Input
        label="Chart title"
        value={title}
        maxLength={100}
        autoFocus
        required
        onChange={(e) => setTitle(e.target.value)}
      />

      <Select
        label="Chart type"
        value={chartType}
        onChange={(e) => setChartType(e.target.value as ChartType)}
      >
        {CHART_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        label="Time range"
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
      >
        {Object.entries(TIME_RANGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        label="Resource"
        value={resourceId ?? ""}
        required
        onChange={(e) => {
          setResourceId(e.target.value ? Number(e.target.value) : null);
          setMetricIds([]);
        }}
      >
        <option value="">Select resource</option>
        {resources.map((resource) => (
          <option key={resource.id} value={resource.id}>
            {resource.name} ({resource.provider_type}, {resource.region})
          </option>
        ))}
      </Select>

      {resourceId !== null &&
        (metrics.length === 0 ? (
          <p>No metrics for this resource yet.</p>
        ) : (
          <div className="chip-group">
            {metrics.map((metric) => {
              const isDisabled = Boolean(currentUnitType && metric.unit !== currentUnitType);

              return (
                <Checkbox
                  key={metric.id}
                  label={`${metric.name} (${metric.unit})`}
                  checked={metricIds.includes(metric.id)}
                  disabled={isDisabled}
                  onChange={() => toggleMetric(metric)}
                />
              );
            })}
          </div>
        ))}

      {error && <p className="modal-error">{error}</p>}

      <div className="modal-actions">
        {isEdit && (
          <Button variant="danger" onClick={handleDelete}>
            Delete chart
          </Button>
        )}
        <Button onClick={close}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving || !title.trim()}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
