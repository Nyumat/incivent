import { IncidentToast } from "@/components/incident-toast";
import { IChatMessage, wsUrl } from "@/lib/utils";
import type { Incident } from "@/platform";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useEffect, useRef } from "react";
import { toast } from "sonner";

interface WebSocketContextType {
  sendNotification: (incident: Incident) => void;
  sendDeletion: (incidentId: string, title: string) => void;
  sendChatMessage: (message: Omit<IChatMessage, "_id">) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const WebSocketContext = createContext<WebSocketContextType | null>(
  null
);

type WebSocketMessage =
  | {
      type: "NEW_INCIDENT";
      incident: Incident;
    }
  | {
      type: "DELETE_INCIDENT";
      incidentId: string;
      title: string;
    }
  | {
      type: "CHAT_MESSAGE";
      message: IChatMessage;
    };

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket Connected");
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          console.log("Received WebSocket message:", data);

          switch (data.type) {
            case "NEW_INCIDENT":
              queryClient.invalidateQueries({ queryKey: ["incidents"] });
              toast.info(<IncidentToast incident={data.incident} />, {
                duration: 5000,
              });
              break;

            case "DELETE_INCIDENT":
              queryClient.invalidateQueries({ queryKey: ["incidents"] });
              toast.info(
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">Incident Removed</div>
                  <div className="text-sm opacity-90">
                    Incident '{data.title}' has been removed by its creator.
                  </div>
                </div>,
                { duration: 3000 }
              );
              window.dispatchEvent(
                new CustomEvent("incident-deleted", {
                  detail: { id: data.incidentId },
                })
              );
              break;

            case "CHAT_MESSAGE":
              window.dispatchEvent(
                new CustomEvent("new-chat-message", {
                  detail: data.message,
                })
              );
              // Only show toast if they're not already in the chat
              if (!document.getElementById("chat")) {
                toast.message(
                  `New message from ${data.message.username}: ${data.message.content}`,
                  {
                    classNames: {
                      toast:
                        "bg-background border border-primary text-primary text-md font-medium max-w-sm",
                      title:
                        "text-sm leading-relaxed text-foreground",
                    },
                    duration: 3000,
                    action: {
                      label: "View",
                      onClick: () => {
                        window.dispatchEvent(
                          new CustomEvent("open-chat", {
                            detail: { messageId: data.message._id },
                          })
                        );
                      },
                    },
                  }
                );
              }
              break;
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

  const sendWebSocketMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
    }
  };

  const sendNotification = (incident: Incident) => {
    sendWebSocketMessage({
      type: "NEW_INCIDENT",
      incident,
    });
  };

  const sendDeletion = (incidentId: string, title: string) => {
    sendWebSocketMessage({
      type: "DELETE_INCIDENT",
      incidentId,
      title,
    });
  };

  const sendChatMessage = (message: Omit<IChatMessage, "_id">) => {
    sendWebSocketMessage({
      type: "CHAT_MESSAGE",
      message: message as IChatMessage,
    });
  };

  return (
    <WebSocketContext.Provider
      value={{ sendNotification, sendDeletion, sendChatMessage }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
