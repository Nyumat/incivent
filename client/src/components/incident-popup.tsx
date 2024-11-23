import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type Incident } from "@/platform";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";
import { Popup } from "react-map-gl";

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "high":
      return {
        icon: AlertOctagon,
        class: "text-destructive bg-destructive/10 hover:bg-destructive/10",
      };
    case "medium":
      return {
        icon: AlertTriangle,
        class: "text-warning bg-warning/10 hover:bg-warning/10",
      };
    case "low":
      return {
        icon: AlertCircle,
        class: "text-info bg-info/10 hover:bg-info/10",
      };
    default:
      return {
        icon: AlertCircle,
        class: "text-info bg-info/10 hover:bg-info/10",
      };
  }
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case "crime":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "emergency":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "hazard":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
  }
};

interface IncidentPopupProps {
  incident: Incident;
  onClose: () => void;
}

export function IncidentPopup({ incident, onClose }: IncidentPopupProps) {
  const severityConfig = getSeverityConfig(incident.severity);
  const SeverityIcon = severityConfig.icon;

  return (
    <Popup
      style={{ background: "none" }}
      anchor="center"
      longitude={incident.longitude}
      latitude={incident.latitude}
      onClose={onClose}
      closeButton={false}
      className="overflow-visible"
    >
      <Card className="w-72 shadow-lg border-0">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base leading-tight">
              {incident.title}
            </CardTitle>
            <Badge
              variant="secondary"
              className={`${getTypeConfig(incident.type)} capitalize`}
            >
              {incident.type}
            </Badge>
          </div>
          <CardDescription className="text-sm mt-1">
            {incident.description}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`gap-1 ${severityConfig.class}`}
            >
              <SeverityIcon className="w-3 h-3" />
              {incident.severity.charAt(0).toUpperCase() +
                incident.severity.slice(1)}{" "}
              Severity
            </Badge>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center text-xs text-muted-foreground gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {new Date(incident.timestamp).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Reported by {incident.reportedBy}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Popup>
  );
}
