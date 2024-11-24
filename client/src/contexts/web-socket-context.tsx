import type { Incident } from "@/platform";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useEffect, useRef } from "react";
import { toast } from "sonner";

interface WebSocketContextType {
  sendNotification: (incident: Incident) => void;
  sendDeletion: (incidentId: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const WebSocketContext = createContext<WebSocketContextType | null>(
  null
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(`ws://localhost:3001`);

      ws.current.onopen = () => {
        console.log("WebSocket Connected");
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received WebSocket message:", data);

          if (data.type === "NEW_INCIDENT" && data.incident) {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
            toast.info(
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{data.incident.title}</div>
                <div className="text-sm opacity-90">
                  New {data.incident.type} reported nearby
                </div>
              </div>,
              {
                duration: 5000,
                action: {
                  label: "View",
                  onClick: () => {
                    window.dispatchEvent(
                      new CustomEvent("new-incident", {
                        detail: data.incident,
                      })
                    );
                  },
                },
              }
            );
          } else if (data.type === "DELETE_INCIDENT" && data.incidentId) {
            queryClient.invalidateQueries({ queryKey: ["incidents"] });
            toast.info(
              <div className="flex flex-col gap-1">
                <div className="font-semibold">Incident Removed</div>
                <div className="text-sm opacity-90">
                  An incident has been deleted by its creator
                </div>
              </div>,
              { duration: 3000 }
            );
            window.dispatchEvent(
              new CustomEvent("incident-deleted", {
                detail: { id: data.incidentId },
              })
            );
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket Disconnected");
        setTimeout(connectWebSocket, 5000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connectWebSocket();

    return () => {
      ws.current?.close();
    };
  }, [queryClient]);

  const sendNotification = (incident: Incident) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "NEW_INCIDENT",
          incident,
        })
      );
    }
  };

  const sendDeletion = (incidentId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "DELETE_INCIDENT",
          incidentId,
        })
      );
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendNotification, sendDeletion }}>
      {children}
    </WebSocketContext.Provider>
  );
}
