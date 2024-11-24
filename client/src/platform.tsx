import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, Flag, Navigation, Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  ScaleControl,
} from "react-map-gl";
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

interface MapContextMenuProps {
  longitude: number;
  latitude: number;
  onClose: () => void;
  onReport: (location: { longitude: number; latitude: number }) => void;
}

export type IncidentType = "crime" | "emergency" | "hazard";
export type IncidentSeverity = "low" | "medium" | "high";

export type Incident = {
  id: number;
  type: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  severity: IncidentSeverity;
  reportedBy: string;
};

export type PopupInfo = Incident | null;

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 1,
    type: "emergency",
    title: "Suspicious Activity",
    description:
      "Incident details for title Suspicious Activity. This incident was reported due to unusual activity in the area.",
    latitude: 45.468208,
    longitude: -122.579274,
    timestamp: "2024-11-23T18:29:45.527189",
    severity: "medium",
    reportedBy: "User702",
  },
  {
    id: 2,
    type: "crime",
    title: "Fire Reported",
    description:
      "Incident details for title Fire Reported. This incident was reported due to unusual activity in the area.",
    latitude: 45.463664,
    longitude: -122.587639,
    timestamp: "2024-11-23T18:29:45.527219",
    severity: "medium",
    reportedBy: "User754",
  },
  {
    id: 3,
    type: "crime",
    title: "Car Accident",
    description:
      "Incident details for title Car Accident. This incident was reported due to unusual activity in the area.",
    latitude: 45.464175,
    longitude: -122.583672,
    timestamp: "2024-11-23T18:29:45.527230",
    severity: "high",
    reportedBy: "User910",
  },
  {
    id: 4,
    type: "hazard",
    title: "Theft Reported",
    description:
      "Incident details for title Theft Reported. This incident was reported due to unusual activity in the area.",
    latitude: 45.471214,
    longitude: -122.587342,
    timestamp: "2024-11-23T18:29:45.527239",
    severity: "low",
    reportedBy: "User700",
  },
  {
    id: 5,
    type: "hazard",
    title: "Medical Emergency",
    description:
      "Incident details for title Medical Emergency. This incident was reported due to unusual activity in the area.",
    latitude: 45.465396,
    longitude: -122.586709,
    timestamp: "2024-11-23T18:29:45.527249",
    severity: "high",
    reportedBy: "User700",
  },
  {
    id: 6,
    type: "hazard",
    title: "Gas Leak",
    description:
      "Incident details for title Gas Leak. This incident was reported due to unusual activity in the area.",
    latitude: 45.467512,
    longitude: -122.570941,
    timestamp: "2024-11-23T18:29:45.527533",
    severity: "low",
    reportedBy: "User617",
  },
  {
    id: 7,
    type: "emergency",
    title: "Medical Emergency",
    description:
      "Incident details for title Medical Emergency. This incident was reported due to unusual activity in the area.",
    latitude: 45.470536,
    longitude: -122.575725,
    timestamp: "2024-11-23T18:29:45.527542",
    severity: "low",
    reportedBy: "User730",
  },
  {
    id: 8,
    type: "emergency",
    title: "Gas Leak",
    description:
      "Incident details for title Gas Leak. This incident was reported due to unusual activity in the area.",
    latitude: 45.464092,
    longitude: -122.583514,
    timestamp: "2024-11-23T18:29:45.527550",
    severity: "low",
    reportedBy: "User880",
  },
  {
    id: 9,
    type: "emergency",
    title: "Flood Warning",
    description:
      "Incident details for title Flood Warning. This incident was reported due to unusual activity in the area.",
    latitude: 45.470267,
    longitude: -122.58802,
    timestamp: "2024-11-23T18:29:45.527558",
    severity: "medium",
    reportedBy: "User935",
  },
  {
    id: 10,
    type: "crime",
    title: "Suspicious Vehicle",
    description:
      "Incident details for title Suspicious Vehicle. This incident was reported due to unusual activity in the area.",
    latitude: 45.470819,
    longitude: -122.584104,
    timestamp: "2024-11-23T18:29:45.527567",
    severity: "medium",
    reportedBy: "User512",
  },
  // More entries continue in similar format...
];

export default function Platform() {
  const { user, isLoggedIn } = useUser();
  const mapRef = useRef<MapRef>(null);
  const [reportDialogKey, setReportDialogKey] = useState(0);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);
  const [filter, setFilter] = useState<IncidentFilter>("all");
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [contextMenu, setContextMenu] = useState<ClickLocation | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const onMapLoad = useCallback(() => {
    const button = document.querySelector(".mapboxgl-ctrl-icon");
    if (button) {
      (button as HTMLElement).click();
    }
  }, []);

  console.log(user, isLoggedIn);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const pins = useMemo(
    () =>
      incidents
        .filter((incident) => filter === "all" || incident.type === filter)
        .map((incident) => (
          <Marker
            key={`marker-${incident.id}`}
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
                onSubmit={(values) => {
                  const newIncident = {
                    id: incidents.length + 1,
                    ...values,
                    timestamp: new Date().toISOString(),
                    reportedBy: "CurrentUser",
                    latitude: values.location.latitude,
                    longitude: values.location.longitude,
                  };
                  setIncidents([...incidents, newIncident]);
                  setSelectedLocation(null);
                  setIsSelectingLocation(false);
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
      <RecentIncidentsCard
        incidents={incidents}
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
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <Navigation className="h-4 w-4" />
            Get Directions
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <Flag className="h-4 w-4" />
            Mark Location
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
