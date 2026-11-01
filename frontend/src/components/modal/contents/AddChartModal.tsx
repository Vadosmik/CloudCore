import { useEffect, useState, type FormEvent } from "react";

import { createChart } from "../../../service/chartService";
import { getResources } from "../../../service/resourceService";
import { getMetricDefinitions } from "../../../service/metricService";
import type { Resource } from "../../../types/resources";
import type { MetricDefinition } from "../../../types/metrics";
import type { ModalContentProps } from "../types";
import { TIME_RANGE_LABELS } from "../../charts/chartTheme";
import Button from "../../ui/button/Button";
import { Input } from "../../ui/input/Input";
import { Select } from "../../ui/input/Select";

export default function AddChartModal({ close, params, onChanged }: ModalContentProps) {
  const dashboardId = Number(params.get("dashboard_id"));

  const [title, setTitle] = useState("");
  const [timeRange, setTimeRange] = useState("1h");
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceId, setResourceId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [metricIds, setMetricIds] = useState<number[]>([]);

  useEffect(() => {
    getResources()
      .then(setResources)
      .catch((error) => console.error("Error loading resources:", error));
  }, []);

  useEffect(() => {
    setMetrics([]);
    setMetricIds([]);
    if (resourceId === null) return;

    getMetricDefinitions(resourceId)
      .then(setMetrics)
      .catch((error) => console.error("Error loading metrics:", error));
  }, [resourceId]);

  const toggleMetric = (id: number) => {
    setMetricIds((prev) =>
      prev.includes(id) ? prev.filter((metricId) => metricId !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || metricIds.length === 0 || !dashboardId) return;

    try {
      await createChart({
        dashboard_id: dashboardId,
        title: title.trim(),
        time_range: timeRange,
        metric_ids: metricIds,
      });
      onChanged();
      close();
    } catch (error) {
      console.error("Error adding chart:", error);
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
        label="Time range"
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value)}
      >
        {Object.entries(TIME_RANGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>

      <Select
        label="Resource"
        value={resourceId ?? ""}
        required
        onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Select resource</option>
        {resources.map((resource) => (
          <option key={resource.id} value={resource.id}>
            {resource.name} ({resource.provider_type}, {resource.region})
          </option>
        ))}
      </Select>

      {resourceId !== null && (
        metrics.length === 0 ? (
          <p>No metrics for this resource yet.</p>
        ) : (
          metrics.map((metric) => (
            <label key={metric.id}>
              <input
                type="checkbox"
                checked={metricIds.includes(metric.id)}
                onChange={() => toggleMetric(metric.id)}
              />
              {metric.name} ({metric.unit})
            </label>
          ))
        )
      )}

      <div className="modal-actions">
        <Button title="Cancel" onClick={close} />
        <Button
          title="Save"
          type="submit"
          className="primary"
          disabled={!title.trim() || metricIds.length === 0}
        />
      </div>
    </form>
  );
}
