import type { ComponentType } from "react";
import type { ModalContentProps } from "./types";

import AddConnectionModal from "./contents/AddConnectionModal";
import AddDashboardModal from "./contents/AddDashboardModal";
import ChartFormModal from "./contents/ChartFormModal";
import SettingModal from "./contents/SettingModal";

export const modalRegistry: Record<
  string,
  { title: string; Content: ComponentType<ModalContentProps> }
> = {
  "add-connection": { title: "Add connection", Content: AddConnectionModal },
  "add-dashboard": { title: "Add dashboard", Content: AddDashboardModal },
  "add-chart": { title: "Add chart", Content: ChartFormModal },
  "edit-chart": { title: "Edit chart", Content: ChartFormModal },
  setting: { title: "Setting", Content: SettingModal },
};
