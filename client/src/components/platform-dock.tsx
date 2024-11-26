import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type User as InciventUser } from "@/hooks/use-user";
import { BASE_URL, cn, IChatMessage } from "@/lib/utils";
import { Incident } from "@/platform";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Clock,
  House,
  MessageSquare,
  Send,
  Settings,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ChatMessage } from "./chat";
import { DeleteIncidentButton } from "./recent-incidents";
import { Dock, DockIcon } from "./ui/dock";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";

interface PlatformDockProps {
  incidents: Incident[] | undefined;
  messages: IChatMessage[];
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  onSelectIncident: (incident: Incident) => void;
  user: InciventUser | undefined;
}

const api = {
  deleteAccount: async (userId: string | undefined) => {
    if (!localStorage.getItem("token")) {
      throw new Error("Unauthorized");
    }

    if (!userId) {
      throw new Error("Missing user ID");
    }

    const { data } = await axios.delete<{ message: string }>(
      `${BASE_URL}/api/auth/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return data.message;
  },
};

export function PlatformDock({
  incidents,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  onSelectIncident,
  user,
}: PlatformDockProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: false,
    welcomeMessage: localStorage.getItem("token"),
  });
  const [notifications, setNotifications] = useState<Incident[] | []>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: () => api.deleteAccount(user?.id),
    onSuccess: (data: string) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success(data + "I'm sorry to see you go!");
      localStorage.removeItem("token");
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isWidgetClick = widgetRef.current?.contains(target);
      const isDockClick = dockRef.current?.contains(target);
      if (!isWidgetClick && !isDockClick && activeWidget) {
        setActiveWidget(null);
      }
    },
    [activeWidget]
  );

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      setActiveWidget("chat");
      setHighlightedMessageId(event.detail.messageId);
    };

    window.addEventListener("open-chat", handleOpenChat as EventListener);
    return () => {
      window.removeEventListener("open-chat", handleOpenChat as EventListener);
    };
  }, []);

  useEffect(() => {
    if (activeWidget === "chat" && highlightedMessageId) {
      setTimeout(() => {
        const messageElement = document.getElementById(highlightedMessageId);
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: "smooth" });
          messageElement.classList.add("highlight-message");
          setTimeout(() => {
            messageElement.classList.remove("highlight-message");
          }, 2000);
        } else {
          scrollToBottom();
        }
        setHighlightedMessageId(null);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWidget, highlightedMessageId]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    (async () => {
      if (!incidents) return;
      try {
        const incidentsNearUser = await getIncidentsNearUserGeoFence(
          incidents as Incident[]
        );
        setNotifications(incidentsNearUser as Incident[]);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [incidents]);

  const getIncidentsNearUserGeoFence = async (incidents: Incident[]) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    const getDistanceFromLatLonInKm = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const R = 6371;
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return d;
    };

    const deg2rad = (deg: number) => {
      return deg * (Math.PI / 180);
    };

    return new Promise((resolve, reject) => {
      function success(pos: GeolocationPosition) {
        const crd = pos.coords;
        const incidentsNearUser = incidents.filter((incident: Incident) => {
          const distance = getDistanceFromLatLonInKm(
            crd.latitude,
            crd.longitude,
            incident.latitude,
            incident.longitude
          );
          return distance <= 5;
        });

        resolve(incidentsNearUser);
      }

      function error(err: GeolocationPositionError) {
        reject(err);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
  };

  const groupedIcons = {
    left: [
      {
        icon: House,
        label: "Go Back to the Home Page",
        show: true,
        id: "home",
        widget: undefined,
        action: () => {
          navigate("/");
        },
      },
      {
        icon: User,
        label: "Profile",
        show: true,
        id: "profile",
        widget: (
          <div className="space-y-4 widget-card p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {user ? (
                  <>
                    <span className="underline">@{user.username}'s</span>{" "}
                    "Incivent Profile"
                  </>
                ) : (
                  "Profile"
                )}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setActiveWidget(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {user ? (
              <div className="text-muted-foreground space-y-4">
                <div className="text-left my-2 flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Name</h2>
                  <h3 className="text-lg">{user.name}</h3>
                  <h2 className="text-lg font-semibold">Username</h2>
                  <p className="text-sm">@{user.username}</p>
                  <h2 className="text-lg font-semibold">Email</h2>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div className="mt-8 flex justify-start gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("token");
                      queryClient.invalidateQueries({
                        queryKey: ["incidents"],
                      });
                      navigate("/");
                    }}
                  >
                    Logout
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => deleteAccount()}
                    disabled={isDeleting}
                    className="flex items-center gap-1"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-center">
                Log in to view your profile or create an account
              </div>
            )}
          </div>
        ),
      },
    ],
    middle: [
      {
        icon: Bell,
        label: "Nearby Incidents",
        show: true,
        id: "notifications",
        widget: (
          <div className="space-y-2 widget-card">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Nearby Incidents</h2>
              <p className="text-xs text-muted-foreground">
                Within 5 miles of your location
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setActiveWidget(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {user && notifications.length > 0 ? (
              <ScrollArea className="h-[60vh] md:h-[500px] pr-4">
                {notifications.map((incident: Incident) => (
                  <div
                    key={incident._id}
                    className="mb-4 cursor-pointer group"
                    onClick={() => {
                      onSelectIncident?.(incident);
                      setActiveWidget(null);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium group-hover:text-primary">
                        {incident.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="text-muted-foreground text-center">
                No Incidents Near You
              </div>
            )}
          </div>
        ),
      },
      {
        icon: AlertTriangle,
        label: "Incidents",
        show: true,
        id: "incidents",
        widget: (
          <div className="space-y-2 widget-card">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Incidents</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWidget(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[60vh] md:h-[500px] pr-4">
              {incidents?.length === 0 ? (
                <div className="text-muted-foreground text-center">
                  No recent incidents
                </div>
              ) : (
                incidents
                  ?.slice()
                  .reverse()
                  .map((incident: Incident) => (
                    <div
                      key={incident._id}
                      className="mb-4 cursor-pointer group"
                      onClick={() => {
                        onSelectIncident?.(incident);
                        setActiveWidget(null);
                      }}
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
                  ))
              )}
            </ScrollArea>
          </div>
        ),
      },
      {
        icon: MessageSquare,
        label: "Chat",
        show: true,
        id: "chat",
        widget: (
          <div className="space-y-2 widget-card" id="chat">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Global Incivent Chat</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWidget(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col h-[60vh] md:h-[500px]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                {messages.map((message: IChatMessage) => (
                  <div
                    key={message._id}
                    id={message._id}
                    className={cn(
                      "transition-colors duration-300 my-2 p-2 rounded-md",
                      "data-[highlighted=true]:bg-accent"
                    )}
                  >
                    <ChatMessage
                      message={message}
                      isOwn={message.userId === user?.id}
                    />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="flex items-center gap-2 pt-4 border-t">
                {user ? (
                  <>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendMessage();
                      }}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-xs text-muted-foreground w-full">
                    Log in to chat with Incivent users around the world
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
      },
    ],
    right: [
      {
        icon: Settings,
        label: "Settings",
        show: true,
        id: "settings",
        widget: (
          <div className="space-y-2 widget-card">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Settings</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setActiveWidget(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-muted-foreground text-center flex flex-col items-start gap-3 py-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={() => {
                    setSettings((prev) => ({
                      ...prev,
                      darkMode: !prev.darkMode,
                    }));
                  }}
                  disabled
                />
                <span className="ml-2 whitespace-nowrap">Dark Mode</span>
              </div>
              <p className="text-[12px] font-light text-left text-muted-foreground">
                Light mode is currently disabled, I'll probably implement it
                post-hackathon.
              </p>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={() => {
                    setSettings((prev) => ({
                      ...prev,
                      notifications: !prev.notifications,
                    }));
                  }}
                />
                <span className="ml-2">New Chat Message Notifications</span>
              </div>
            </div>
          </div>
        ),
      },
    ],
  };

  const handleIconClick = (id: string) => {
    if (id === "home") return navigate("/");
    if (activeWidget === id) {
      setActiveWidget(null);
    } else {
      setActiveWidget(id);
    }
  };

  const getAllIcons = () => [
    ...groupedIcons.left,
    ...groupedIcons.middle,
    ...groupedIcons.right,
  ];

  return (
    <>
      <AnimatePresence>
        {activeWidget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setActiveWidget(null)}
            />
            <motion.div
              ref={widgetRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none"
            >
              <Card className="w-[90vw] max-w-[400px] shadow-lg pointer-events-auto">
                <CardContent className="p-6">
                  {
                    getAllIcons().find((icon) => icon.id === activeWidget)
                      ?.widget
                  }
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-50" ref={dockRef}>
        <TooltipProvider>
          <Dock
            className={cn(
              "-translate-y-8 sm::translate-y-5",
              activeWidget &&
                "translate-y-4 transition-all duration-300 ease-in-out",
              !activeWidget && "transition-all duration-300 ease-in-out"
            )}
          >
            {groupedIcons.left.map((item) => (
              <DockIcon key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleIconClick(item.id)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full dock-button",
                        activeWidget === item.id && "bg-accent"
                      )}
                    >
                      <item.icon className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-8" />
            {groupedIcons.middle.map((item) => (
              <DockIcon key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleIconClick(item.id)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full dock-button",
                        activeWidget === item.id && "bg-accent"
                      )}
                    >
                      <item.icon className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-8" />
            {groupedIcons.right.map((item) => (
              <DockIcon key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleIconClick(item.id)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full dock-button",
                        activeWidget === item.id && "bg-accent"
                      )}
                    >
                      <item.icon className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
          </Dock>
        </TooltipProvider>
      </div>
    </>
  );
}
