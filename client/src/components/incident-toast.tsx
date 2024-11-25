import { Incident, IncidentSeverity, IncidentType } from "@/platform";
import { AlertCircle, AlertTriangle, Siren } from "lucide-react";

export const IncidentToast = ({ incident }: { incident: Incident }) => {
  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case "crime":
        return <Siren className="w-5 h-5 text-red-500" />;
      case "emergency":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "hazard":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md w-full">
      <div className="flex-shrink-0 mt-1">{getTypeIcon(incident.type)}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {incident.title}
          </h3>
          <span
            className={`px-2 py-0.5 text-xs whitespace-nowrap font-medium text-white rounded-full justify-end ${getSeverityColor(
              incident.severity
            )}`}
          >
            {incident.severity.charAt(0).toUpperCase() +
              incident.severity.slice(1)}{" "}
            Severity
          </span>
        </div>

        <div className="mt-1 text-sm text-gray-600">
          New {incident.type} reported at {formatTimestamp(incident.timestamp)}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Reported by {incident.reportedBy.username}
        </div>
      </div>
    </div>
  );
};
