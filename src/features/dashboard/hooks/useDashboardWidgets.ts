import { useState, useEffect, useCallback } from "react";

export type WidgetKey = "stats" | "operationTypes" | "recentActivity";

export interface WidgetConfig {
  key: WidgetKey;
  label: string;
  visible: boolean;
}

const STORAGE_KEY = "dashboard_widgets_v1";

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { key: "stats", label: "Statistiques globales", visible: true },
  { key: "operationTypes", label: "Types d'opérations", visible: true },
  { key: "recentActivity", label: "Activité récente", visible: true },
];

export const useDashboardWidgets = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WidgetConfig[];
        // merge with defaults to add any new widgets
        return DEFAULT_WIDGETS.map((d) => parsed.find((p) => p.key === d.key) || d);
      }
    } catch {}
    return DEFAULT_WIDGETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const toggleWidget = useCallback((key: WidgetKey) => {
    setWidgets((prev) =>
      prev.map((w) => (w.key === key ? { ...w, visible: !w.visible } : w))
    );
  }, []);

  const isVisible = useCallback(
    (key: WidgetKey) => widgets.find((w) => w.key === key)?.visible ?? true,
    [widgets]
  );

  const resetWidgets = useCallback(() => setWidgets(DEFAULT_WIDGETS), []);

  return { widgets, toggleWidget, isVisible, resetWidgets };
};
