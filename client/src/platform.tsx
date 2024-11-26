import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  Flag,
  LogIn,
  LogOut,
  Navigation,
  Plus,
  UserPlus,
  X,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  ScaleControl,
} from "react-map-gl";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LoginDialog, SignupDialog } from "./components/auth";
import { FilterControls, IncidentFilter } from "./components/incident-filter";
import { IncidentPopup } from "./components/incident-popup";
import { PlatformDock } from "./components/platform-dock";
import { EnhancedReportIncidentDialog } from "./components/report-dialog";
import { SpeedDial } from "./components/speed-dial";
import { Spinner } from "./components/ui/spinner";
import { useUser } from "./hooks/use-user";
import { useWebSocket } from "./hooks/use-websocket";
import { BASE_URL, IChatMessage } from "./lib/utils";

export type PopupInfo = Incident | null;
export type SelectedIncident = Incident | null;
export type IncidentFlag = "public" | "private";
export type IncidentSeverity = "low" | "medium" | "high";
export type InciventUser = Omit<IUser, "__v" | "password">;
export type IncidentType = "crime" | "emergency" | "hazard";
export type SelectedLocation = { longitude: number; latitude: number } | null;
export interface ClickLocation {
  longitude: number;
  latitude: number;
  x: number;
  y: number;
}
export interface CustomMarker {
  id: string;
  longitude: number;
  latitude: number;
}
export interface MapContextMenuProps {
  longitude: number;
  latitude: number;
  onClose: () => void;
  onReport: (location: { longitude: number; latitude: number }) => void;
  onMarkLocation: () => void;
}
export interface Incident {
  _id: string;
  type: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  severity: IncidentSeverity;
  reportedBy: InciventUser;
}
export interface IUser {
  _id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  __v: number;
}

export const STORAGE_KEY = "poi-markers";
// eslint-disable-next-line react-refresh/only-export-components
export const api = {
  getIncidents: async (): Promise<Incident[]> => {
    const { data } = await axios.get(`${BASE_URL}/api/incidents`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  },
  createIncident: async (
    incidentData: Omit<Incident, "_id" | "reportedBy">
  ) => {
    const { data } = await axios.post(
      `${BASE_URL}/api/incidents`,
      incidentData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return data;
  },
  updateIncident: async (id: string, updates: Partial<Incident>) => {
    const { data } = await axios.patch(
      `${BASE_URL}/api/incidents/${id}`,
      updates,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return data;
  },
  deleteIncident: async (id: string) => {
    const { data } = await axios.delete(`${BASE_URL}/api/incidents/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  },
};

export default function Platform() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const mapRef = useRef<MapRef>(null);
  const queryClient = useQueryClient();
  const { sendChatMessage } = useWebSocket();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [reportDialogKey, setReportDialogKey] = useState(0);
  const [filter, setFilter] = useState<IncidentFilter>("all");
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>([]);
  const [contextMenu, setContextMenu] = useState<ClickLocation | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation>(null);
  const [selectedIncident, setSelectedIncident] =
    useState<SelectedIncident>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (event: CustomEvent<IChatMessage>) => {
      setMessages((prev) => [...prev, event.detail]);
    };

    window.addEventListener(
      "new-chat-message",
      handleNewMessage as EventListener
    );
    return () => {
      window.removeEventListener(
        "new-chat-message",
        handleNewMessage as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const savedMarkers = localStorage.getItem(STORAGE_KEY);
    if (savedMarkers) {
      setCustomMarkers(JSON.parse(savedMarkers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customMarkers));
  }, [customMarkers]);

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: api.getIncidents,
  });

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("signup") === "true") {
      // TODO: What a crazy hack
      const button = document.getElementById("speed-dial-trigger");
      if (button) {
        button.click();
      }

      if (!localStorage.getItem("token") && !isLoggedIn) {
        toast.custom(
          (t) => (
            <div className="bg-background border border-primary text-primary text-lg font-medium space-x-2 p-4 rounded-md flex items-center relative">
              <img
                src="/icon.png"
                alt="Incivent Logo"
                className="w-8 h-8 mr-4 scale-150"
              />
              <div className="flex flex-col">
                <div className="text-lg font-medium leading-relaxed text-foreground">
                  Welcome to Incivent!
                </div>
                <div className="text-md leading-relaxed text-foreground">
                  Report incidents, chat with others, and stay safe!
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="ml-auto p-2 rounded-full hover:bg-primary/10 transition-colors absolute right-2 top-2"
              >
                <X className="w-4 h-4 text-whitee" />
              </button>
            </div>
          ),
          {
            duration: 5000,
          }
        );

        setSignUpOpen(true);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, [isLoggedIn]);

  const onMapLoad = useCallback(() => {
    const button = document.querySelector(".mapboxgl-ctrl-icon");
    if (button) {
      (button as HTMLElement).click();
    }
  }, []);

  const handleMapClick = useCallback(
    (event: mapboxgl.MapLayerMouseEvent) => {
      if (isSelectingLocation) {
        setSelectedLocation({
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng,
        });
        setIsSelectingLocation(false);
        setShowReportDialog(true);
        return;
      }

      setContextMenu(null);
    },
    [isSelectingLocation]
  );

  const handleSendMessage = () => {
    if (!user || !newMessage.trim()) return;

    const message: Omit<IChatMessage, "_id"> = {
      userId: user.id,
      username: user.username,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    sendChatMessage(message);
    setNewMessage("");
  };

  const handleReport = (location: { longitude: number; latitude: number }) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to report an incident");
      return;
    }
    setSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setShowReportDialog(true);
    setContextMenu(null);
  };

  const handleContextMenu = (event: mapboxgl.MapLayerMouseEvent) => {
    event.preventDefault();
    setContextMenu({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      x: event.point.x,
      y: event.point.y,
    });
  };

  const handleReportSuccess = async (values: {
    type: IncidentType;
    title: string;
    description: string;
    severity: IncidentSeverity;
    location: { latitude: number; longitude: number };
  }) => {
    try {
      const incidentData = {
        type: values.type,
        title: values.title,
        description: values.description,
        severity: values.severity,
        latitude: values.location.latitude,
        longitude: values.location.longitude,
        timestamp: new Date().toISOString(),
      };

      await api.createIncident(incidentData);
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSelectedLocation(null);
      setIsSelectingLocation(false);
      setShowReportDialog(false);
      toast.success("Incident reported successfully");
    } catch (error) {
      console.error("Error creating incident:", error);
      toast.error("Failed to report incident");
    }
  };

  const handleSelectIncident = (incident: Incident) => {
    if (!mapRef.current) return;
    if (!incident) return;
    setSelectedIncident(incident);
    if (selectedIncident) {
      mapRef?.current?.flyTo({
        center: [selectedIncident.longitude, selectedIncident.latitude],
        zoom: 15,
        duration: 2000,
      });
    }
  };

  const handleMarkLocation = () => {
    if (!contextMenu) return;

    const newMarker: CustomMarker = {
      id: crypto.randomUUID(),
      longitude: contextMenu.longitude,
      latitude: contextMenu.latitude,
    };

    setCustomMarkers((prev) => [...prev, newMarker]);
    setContextMenu(null);
    toast.success("Location marked successfully");
  };

  const handleRemoveMarker = (markerId: string) => {
    setCustomMarkers((prev) => prev.filter((marker) => marker.id !== markerId));
    toast.success("Marker removed successfully");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.invalidateQueries({ queryKey: ["incidents"] });
    navigate("/");
  };

  const getSpeedDialActions = () => {
    if (!isLoggedIn) {
      return [
        {
          icon: <LogIn className="h-4 w-4" />,
          label: "Login",
          trigger: <LoginDialog />,
        },
        {
          icon: <UserPlus className="h-4 w-4" />,
          label: "Sign Up",
          trigger: <SignupDialog setOpen={setSignUpOpen} open={signUpOpen} />,
        },
      ];
    }

    return [
      {
        icon: <Plus className="h-4 w-4" />,
        label: "Report Incident",
        trigger: (
          <EnhancedReportIncidentDialog
            key={reportDialogKey}
            trigger={
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  setShowReportDialog(true);
                  setSelectedLocation(null);
                  setReportDialogKey((prev) => prev + 1);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            }
            onSubmitSuccess={handleReportSuccess}
            initialLocation={selectedLocation}
            open={showReportDialog}
            onOpenChange={(open) => {
              setShowReportDialog(open);
              if (!open) {
                setSelectedLocation(null);
              }
            }}
            onRequestLocationSelect={() => {
              setIsSelectingLocation(true);
              setShowReportDialog(false);
              setSelectedLocation(null);
            }}
          />
        ),
      },
      {
        icon: <LogOut className="h-4 w-4" />,
        label: "Logout",
        action: handleLogout,
        variant: "outline",
      },
    ];
  };

  const pins = useMemo(
    () =>
      incidents
        ?.filter((incident) => filter === "all" || incident.type === filter)
        .map((incident) => (
          <Marker
            key={`marker-${incident._id}`}
            longitude={incident.longitude}
            latitude={incident.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(incident);
            }}
          >
            <AlertCircle
              className={`w-6 h-6 ${
                incident.severity === "high"
                  ? "text-red-500"
                  : incident.severity === "medium"
                  ? "text-yellow-500"
                  : "text-blue-500"
              }`}
            />
          </Marker>
        )),
    [incidents, filter]
  );

  const customMarkerElements = useMemo(
    () =>
      customMarkers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
        >
          <div className="relative group">
            <Flag className="w-6 h-6 text-primary" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMarker(marker.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Marker>
      )),
    [customMarkers]
  );

  return (
    <>
      <Map
        ref={mapRef}
        onLoad={onMapLoad}
        initialViewState={{
          latitude: 45.5051,
          longitude: -122.675,
          zoom: 12,
          bearing: 0,
          pitch: 0,
        }}
        onContextMenu={handleContextMenu}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        cursor={isSelectingLocation ? "crosshair" : "default"}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        {isSelectingLocation && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-background/90 text-foreground px-4 py-2 rounded-full shadow-lg">
            Click on the map to select incident location
          </div>
        )}
        {contextMenu && (
          <MapContextMenu
            longitude={contextMenu.x}
            latitude={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onMarkLocation={handleMarkLocation}
            onReport={() =>
              handleReport({
                longitude: contextMenu.longitude,
                latitude: contextMenu.latitude,
              })
            }
          />
        )}
        {contextMenu && (
          <Marker
            longitude={contextMenu.longitude}
            latitude={contextMenu.latitude}
            anchor="bottom"
          >
            <div className="w-4 h-4 bg-primary/50 rounded-full animate-pulse" />
          </Marker>
        )}
        {popupInfo && (
          <IncidentPopup
            incident={popupInfo}
            onClose={() => setPopupInfo(null)}
          />
        )}
        {pins}
        {customMarkerElements}
      </Map>
      <div className="absolute left-0 bottom-0 right-0 p-4 flex justify-center">
        {isLoading && (
          <Spinner
            childSize="h-6 w-6"
            className="bg-gradient-to-bl from-black to-blue-400"
            outerSize="h-8 w-8"
          />
        )}
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        {!isLoggedIn && (
          <>
            <div className="">
              <SpeedDial
                direction="down"
                actionButtons={getSpeedDialActions()}
                loggedIn={isLoggedIn}
              />
            </div>
          </>
        )}

        {isLoggedIn && (
          <div className="absolute top-4 right-4">
            <div className="flex gap-2">
              <SpeedDial
                direction="down"
                actionButtons={getSpeedDialActions()}
                loggedIn={isLoggedIn}
              />
            </div>
          </div>
        )}
      </div>

      <FilterControls filter={filter} onFilterChange={setFilter} />
      <PlatformDock
        incidents={incidents ?? []}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        onSelectIncident={handleSelectIncident}
        user={user}
      />
    </>
  );
}

function MapContextMenu({
  longitude,
  latitude,
  onClose,
  onReport,
  onMarkLocation,
}: MapContextMenuProps) {
  return (
    <div
      className="absolute"
      style={{
        left: longitude,
        top: latitude,
      }}
    >
      <DropdownMenu
        defaultOpen={true}
        onOpenChange={(open) => !open && onClose()}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-0 w-0 p-0 m-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => onReport({ longitude, latitude })}
            className="gap-2 cursor-pointer"
          >
            <AlertCircle className="h-4 w-4" />
            Report Incident
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={() => {
              toast.error(
                "This feature is not yet implemented, hackathons are hard"
              );
            }}
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={onMarkLocation}
          >
            <Flag className="h-4 w-4" />
            Mark Location
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
