import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useUser } from "@/hooks/use-user";
import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";
import { api, Incident } from "@/platform";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bell, ChevronUp, Clock, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface RecentIncidentsProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteIncidentButton({ incident }: { incident: Incident }) {
  const queryClient = useQueryClient();
  const { sendDeletion } = useWebSocket();

  const { mutate: deleteIncident, isPending: isDeleting } = useMutation({
    mutationFn: () => api.deleteIncident(incident._id),
    onSuccess: () => {
      sendDeletion(incident._id, incident.title);
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Incident deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete incident");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Incident Report</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this incident report? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              deleteIncident();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function RecentIncidentsCard({
  incidents,
  onSelectIncident,
  isCollapsed,
  setIsCollapsed,
}: RecentIncidentsProps) {
  const { user } = useUser();

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
                          {incident.type.charAt(0).toUpperCase() +
                            incident.type.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(incident.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {user?.id === incident.reportedBy._id && (
                      <DeleteIncidentButton incident={incident} />
                    )}
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
