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
import { RecentIncidentsCard, RecentIncidentsSheet } from "./components/recent-incidents";
import { ReportIncidentDialog } from "./components/report-incident";

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
    type: "crime",
    title: "Suspicious Activity",
    description: "Person looking into car windows",
    latitude: 40.7128,
    longitude: -74.006,
    timestamp: new Date().toISOString(),
    severity: "medium",
    reportedBy: "User123",
  },
  {
    id: 2,
    type: "emergency",
    title: "Fire Reported",
    description: "Small fire in trash can",
    latitude: 40.758,
    longitude: -73.9855,
    timestamp: new Date().toISOString(),
    severity: "high",
    reportedBy: "User456",
  },
];

export default function Platform() {
  const mapRef = useRef<MapRef>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    // TODO: do something with the map
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
          latitude: 40.7128,
          longitude: -74.006,
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

      {/* Header Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        {!isLoggedIn && (
          <>
            <LoginDialog
              onLogin={(email, password) => {
                console.log({ email, password });
                setIsLoggedIn(true);
              }}
            />
            <SignupDialog
              onSignup={(email, password, name) => {
                console.log({ email, password, name });
                setIsLoggedIn(true);
              }}
            />
          </>
        )}

        {isLoggedIn && (
          <div className="absolute top-4 right-4">
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
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <FilterControls filter={filter} onFilterChange={setFilter} />

      <RecentIncidentsCard
        incidents={incidents}
        onSelectIncident={handleSelectIncident}
      />

      <RecentIncidentsSheet
        incidents={incidents}
        onSelectIncident={(incident) => {
          setPopupInfo(incident);
        }}
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
