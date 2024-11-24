import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, Flag, Navigation, Plus, X } from "lucide-react";
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
import { toast } from "sonner";
import { LoginDialog, SignupDialog } from "./components/auth";
import { FilterControls, IncidentFilter } from "./components/incident-filter";
import { IncidentPopup } from "./components/incident-popup";
import { RecentIncidentsCard } from "./components/recent-incidents";
import { ReportIncidentDialog } from "./components/report-incident";
import { useUser } from "./hooks/use-user";

interface ClickLocation {
  longitude: number;
  latitude: number;
  x: number;
  y: number;
}

interface CustomMarker {
  id: string;
  longitude: number;
  latitude: number;
}

interface MapContextMenuProps {
  longitude: number;
  latitude: number;
  onClose: () => void;
  onReport: (location: { longitude: number; latitude: number }) => void;
  onMarkLocation: () => void;
}

export type IncidentType = "crime" | "emergency" | "hazard";
export type IncidentSeverity = "low" | "medium" | "high";

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

export type InciventUser = Omit<IUser, "__v" | "password">;

export type PopupInfo = Incident | null;

const STORAGE_KEY = "custom_markers";

// eslint-disable-next-line react-refresh/only-export-components
export const api = {
  getIncidents: async (): Promise<Incident[]> => {
    const { data } = await axios.get("/api/incidents", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  },
  createIncident: async (
    incidentData: Omit<Incident, "_id" | "reportedBy">
  ) => {
    const { data } = await axios.post("/api/incidents", incidentData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  },
  updateIncident: async (id: string, updates: Partial<Incident>) => {
    const { data } = await axios.patch(`/api/incidents/${id}`, updates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  },
  deleteIncident: async (id: string) => {
    const { data } = await axios.delete(`/api/incidents/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return data;
  },
};

export default function Platform() {
  const { isLoggedIn } = useUser();
  const queryClient = useQueryClient();
  const mapRef = useRef<MapRef>(null);
  const [reportDialogKey, setReportDialogKey] = useState(0);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);
  const [filter, setFilter] = useState<IncidentFilter>("all");
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [contextMenu, setContextMenu] = useState<ClickLocation | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>([]);

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

  const onMapLoad = useCallback(() => {
    const button = document.querySelector(".mapboxgl-ctrl-icon");
    if (button) {
      (button as HTMLElement).click();
    }
  }, []);

  const getCurrentMapCenter = useCallback(() => {
    if (!mapRef.current) return null;
    const center = mapRef.current.getCenter();
    return {
      latitude: center.lat,
      longitude: center.lng,
    };
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

  const handleContextMenu = (event: mapboxgl.MapLayerMouseEvent) => {
    event.preventDefault();
    setContextMenu({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      x: event.point.x,
      y: event.point.y,
    });
  };

  const handleReport = (location: { longitude: number; latitude: number }) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to report an incident");
      return;
    }
    setSelectedLocation(location);
    setShowReportDialog(true);
    setContextMenu(null);
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
    window.location.reload();
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

        {pins}
        {customMarkerElements}

        {popupInfo && (
          <IncidentPopup
            incident={popupInfo}
            onClose={() => setPopupInfo(null)}
          />
        )}
      </Map>

      <div className="absolute top-4 right-4 flex gap-2">
        {!isLoggedIn && (
          <>
            <LoginDialog />
            <SignupDialog />
          </>
        )}

        {isLoggedIn && (
          <div className="absolute top-4 right-4">
            <div className="flex gap-2">
              <ReportIncidentDialog
                key={reportDialogKey}
                trigger={
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowReportDialog(true);
                      setReportDialogKey((prev) => prev + 1);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Report Incident
                  </Button>
                }
                onSubmitSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["incidents"] });
                  setSelectedLocation(null);
                  setIsSelectingLocation(false);
                  setShowReportDialog(false);
                }}
                initialLocation={selectedLocation}
                mapCenter={getCurrentMapCenter()}
                open={showReportDialog}
                onOpenChange={setShowReportDialog}
                onRequestLocationSelect={() => {
                  setIsSelectingLocation(true);
                }}
              />

              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
      <FilterControls filter={filter} onFilterChange={setFilter} />
      {isLoading && <div>Loading...</div>}
      {!isLoading && incidents && incidents.length === 0 && (
        <div>No incidents found</div>
      )}
      <RecentIncidentsCard
        incidents={incidents ?? []}
        onSelectIncident={handleSelectIncident}
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
