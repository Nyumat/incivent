/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressMinimap } from "@mapbox/search-js-react";
import { AlertTriangle, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const reportFormSchema = z.object({
  type: z.enum(["crime", "emergency", "hazard"], {
    required_error: "Please select an incident type",
  }),
  title: z.string().min(5, {
    message: "Title must be at least 5 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  severity: z.enum(["low", "medium", "high"], {
    required_error: "Please select a severity level",
  }),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface EnhancedReportIncidentDialogProps {
  onSubmitSuccess?: (values: ReportFormValues) => void;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
  trigger: React.ReactNode;
  onRequestLocationSelect?: () => void;
}

export function EnhancedReportIncidentDialog({
  onSubmitSuccess,
  open,
  onOpenChange,
  initialLocation,
  trigger,
  onRequestLocationSelect,
}: EnhancedReportIncidentDialogProps) {
  const [addressText, setAddressText] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: "crime",
      severity: "medium",
      location: {
        latitude: 0,
        longitude: 0,
      },
    },
  });

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setAddressText(address);
        form.setValue("location.address", address);
      } else {
        setAddressText("No address found");
        form.setValue("location.address", "No address found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressText("Error fetching address");
      form.setValue("location.address", "Error fetching address");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  useEffect(() => {
    if (initialLocation) {
      form.setValue("location", {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      });
      fetchAddress(initialLocation.latitude, initialLocation.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation]);

  useEffect(() => {
    if (!open) {
      form.reset({
        type: "crime",
        severity: "medium",
        location: {
          latitude: 0,
          longitude: 0,
        },
      });
      setAddressText(null);
    }
  }, [open, form]);

  const handleSubmit = (values: ReportFormValues) => {
    const finalValues = {
      ...values,
      timestamp: new Date().toISOString(),
    };

    onSubmitSuccess?.(finalValues);
    onOpenChange?.(false);
  };

  const hasLocation = Boolean(initialLocation);

  const minimapFeature = initialLocation
    ? {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [initialLocation.longitude, initialLocation.latitude],
        },
        properties: {
          title: "Selected Location",
          "marker-symbol": "marker",
          "marker-color": "#00000",
          "marker-size": "small",
          draggable: true,
        },
      }
    : null;

  const handleReselectLocation = () => {
    onRequestLocationSelect?.();
    onOpenChange?.(false);
  };

  const handleMarkerDrag = async (evt: any) => {
    const lngLat = evt.target.getLngLat();
    form.setValue("location", {
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    });
    fetchAddress(lngLat.lat, lngLat.lng);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>
            {hasLocation
              ? addressText ?? `Loading address...`
              : "Click 'Select on Map' to choose a location"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select incident type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="crime">Crime</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="hazard">Hazard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Severity</SelectItem>
                          <SelectItem value="medium">
                            Medium Severity
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2 text-destructive">
                              <AlertTriangle className="h-4 w-4" />
                              High Severity
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter incident title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the incident in detail"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Location */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Location</FormLabel>
                    {hasLocation && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleReselectLocation}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Reselect
                      </Button>
                    )}
                  </div>

                  {hasLocation ? (
                    <div className="relative min-h-56 w-full text-black">
                      <AddressMinimap
                        key={initialLocation?.latitude}
                        feature={minimapFeature}
                        show={hasLocation}
                        canAdjustMarker={true}
                        adjustBtnText="Move Marker"
                        onSaveMarkerLocation={(coordinate) => {
                          document.startViewTransition();
                          handleMarkerDrag({
                            target: {
                              getLngLat: () => ({
                                lat: coordinate[1],
                                lng: coordinate[0],
                              }),
                            },
                          });
                          document.endViewTransition();
                        }}
                        mapStyleMode="satellite"
                        defaultMapStyle={["mapbox", "streets-v11"]}
                        accessToken={MAPBOX_ACCESS_TOKEN}
                        onFeatureDrag={handleMarkerDrag}
                      />
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleReselectLocation}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Select on Map
                    </Button>
                  )}
                  <p className="text-xs font-light mt-2">
                    {hasLocation
                      ? "Drag the marker to provide a more precise location"
                      : "Click the button to select a location on the map"}
                  </p>
                </div>

                {hasLocation && (
                  <div className="rounded-lg p-4 shadow-sm border">
                    <p className="text-sm font-semibold mb-2">
                      Selected Location
                    </p>
                    {isLoadingAddress ? (
                      <p className="text-sm p-3 animate-pulse">
                        Loading address...
                      </p>
                    ) : (
                      <p className="text-sm  leading-relaxed">{addressText}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!hasLocation || isLoadingAddress}
              >
                Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
