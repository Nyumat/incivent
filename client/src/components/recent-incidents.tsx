import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Incident } from "@/platform";
import { AlertTriangle, Bell, ChevronUp, Clock } from "lucide-react";
import { useState } from "react";

interface RecentIncidentsProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export function RecentIncidentsCard({
  incidents,
  onSelectIncident,
}: RecentIncidentsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <Card
      className="fixed bottom-4 right-4 w-80 shadow-lg transition-all duration-300"
      style={{
        transform: isCollapsed
          ? "translateY(calc(100% - 40px))"
          : "translateY(0)",
      }}
    >
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <CardTitle className="text-sm">Recent Incidents</CardTitle>
          </div>
          <ChevronUp
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed ? "rotate-180" : ""
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="text-muted-foreground text-center">
            No recent incidents
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            {incidents
              .slice()
              .reverse()
              .map((incident) => (
                <div
                  key={incident._id}
                  className="mb-4 cursor-pointer group"
                  onClick={() => onSelectIncident(incident)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium group-hover:text-primary">
                        {incident.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            incident.severity === "high"
                              ? "destructive"
                              : incident.severity === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {incident.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(incident.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentIncidentsSheet({
  incidents,
  onSelectIncident,
}: RecentIncidentsProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Recent Incidents
          <Badge variant="secondary" className="ml-2">
            {incidents.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Recent Incidents</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          {incidents
            .slice()
            .reverse()
            .map((incident) => (
              <Card
                key={incident._id}
                className="mb-4 cursor-pointer hover:bg-accent"
                onClick={() => {
                  onSelectIncident(incident);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{incident.title}</h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge
                          variant={
                            incident.severity === "high"
                              ? "destructive"
                              : incident.severity === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline">{incident.type}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(incident.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {incident.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {incident.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
