import { Settings2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WidgetConfig, WidgetKey } from "../hooks/useDashboardWidgets";

interface Props {
  widgets: WidgetConfig[];
  onToggle: (key: WidgetKey) => void;
  onReset: () => void;
}

export const DashboardCustomizer = ({ widgets, onToggle, onReset }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Personnaliser</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background">
        <DropdownMenuLabel>Widgets visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {widgets.map((w) => (
          <DropdownMenuCheckboxItem
            key={w.key}
            checked={w.visible}
            onCheckedChange={() => onToggle(w.key)}
            onSelect={(e) => e.preventDefault()}
          >
            {w.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
