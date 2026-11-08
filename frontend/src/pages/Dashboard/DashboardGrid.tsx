import { useState } from "react";
import GridLayout, { useContainerWidth, type Layout } from "react-grid-layout";

import type { MetricDataPoint } from "../../types/metrics";
import type { Chart } from "../../types/charts";
import ChartCard from "../../components/charts/ChartCard";
import { updateDashboardLayout } from "../../service/dashboardService";
import { TIME_RANGE_MS } from "../../components/charts/chartTheme";
import { useIsMobile } from "../../hooks/useMediaQuery";

// punkty danych należące do wykresu i mieszczące się w jego zakresie czasu
function seriesForChart(chart: Chart, series: MetricDataPoint[]) {
  const chartMetricIds = new Set(chart.metrics.map((metric) => metric.id));
  const since = Date.now() - TIME_RANGE_MS[chart.time_range];

  return series.filter(
    (point) =>
      chartMetricIds.has(point.metric_definition_id) &&
      new Date(point.timestamp).getTime() >= since,
  );
}

interface DashboardGridProps {
  dashboardId: number;
  charts: Chart[];
  series: MetricDataPoint[];
}

export function DashboardGrid({ dashboardId, charts, series }: DashboardGridProps) {
  const isMobile = useIsMobile();
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

  // === MOBILE: jeden pod drugim, bez przeciągania (tylko podgląd) ===
  if (isMobile) {
    const ordered = [...charts].sort((a, b) => a.pos_y - b.pos_y || a.pos_x - b.pos_x);

    return (
      <div className="dashboard-page__stack">
        {ordered.map((chart) => (
          <div key={chart.id} className="dashboard-page__stack-item">
            <ChartCard chart={chart} series={seriesForChart(chart, series)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {mounted && (
        <GridLayout
          layout={layout}
          gridConfig={{ cols: 12, rowHeight: 60 }}
          dragConfig={{ handle: ".chart-card__header" }}
          width={width}
          onLayoutChange={setSavedLayout}
          onDragStop={handleLayoutSave}
          onResizeStop={handleLayoutSave}
        >
          {charts.map((chart) => (
            <div key={chart.id}>
              <ChartCard chart={chart} series={seriesForChart(chart, series)} />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
}
