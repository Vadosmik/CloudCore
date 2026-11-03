import { useState } from "react";
import GridLayout, { useContainerWidth, type Layout } from "react-grid-layout";

import type { MetricDataPoint } from "../../types/metrics";
import type { Chart } from "../../types/charts";
import ChartCard from "../../components/charts/ChartCard";
import { updateDashboardLayout } from "../../service/dashboardService";
import { TIME_RANGE_MS } from "../../components/charts/chartTheme";

interface DashboardGridProps {
  dashboardId: number;
  charts: Chart[];
  series: MetricDataPoint[];
}

export function DashboardGrid({ dashboardId, charts, series }: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });
  const [savedLayout, setSavedLayout] = useState<Layout>([]);

  const layout = charts.map((chart) => {
    const saved = savedLayout.find((item) => item.i === String(chart.id));

    return {
      i: String(chart.id),
      x: saved?.x ?? chart.pos_x,
      y: saved?.y ?? chart.pos_y,
      w: saved?.w ?? chart.width,
      h: saved?.h ?? chart.height,
      minW: 3,
      minH: 4,
    };
  });

  const handleLayoutSave = async (newLayout: Layout) => {
    try {
      await updateDashboardLayout(
        dashboardId,
        newLayout.map((item) => ({
          chart_id: Number(item.i),
          pos_x: item.x,
          pos_y: item.y,
          width: item.w,
          height: item.h,
        })),
      );
    } catch (error) {
      console.error("Error saving layout: ", error);
    }
  };

  return (
    <div ref={containerRef}>
      {mounted && (
        <GridLayout
          layout={layout}
          gridConfig={{ cols: 12, rowHeight: 60 }}
          dragConfig={{ handle: ".chart-card-header" }}
          width={width}
          onLayoutChange={setSavedLayout}
          onDragStop={handleLayoutSave}
          onResizeStop={handleLayoutSave}
        >
          {charts.map((chart) => {
            const chartMetricIds = new Set(chart.metrics.map((metric) => metric.id));
            const since = Date.now() - TIME_RANGE_MS[chart.time_range];

            const chartSeries = series.filter(
              (point) =>
                chartMetricIds.has(point.metric_definition_id) &&
                new Date(point.timestamp).getTime() >= since,
            );

            return (
              <div key={chart.id}>
                <ChartCard chart={chart} series={chartSeries} />
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}
