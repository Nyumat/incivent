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
  FormDescription,
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
import { AlertTriangle, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportIncidentDialogProps {
  onSubmit: (values: ReportFormValues) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialLocation?: { latitude: number; longitude: number } | null;
  trigger?: React.ReactNode;
  mapCenter?: { latitude: number; longitude: number } | null;
  onRequestLocationSelect?: () => void;
}

export function ReportIncidentDialog({
  onSubmit,
  open,
  onOpenChange,
  initialLocation,
  trigger,
  mapCenter,
  onRequestLocationSelect,
}: ReportIncidentDialogProps) {
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  const defaultValues: Partial<ReportFormValues> = {
    type: "crime",
    title: "",
    description: "",
    severity: "medium",
    location: initialLocation ??
      mapCenter ?? {
        latitude: 0,
        longitude: 0,
      },
  };

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialLocation) {
      form.setValue("location", initialLocation);
      setHasRequestedLocation(false);
    }
  }, [initialLocation, form]);

  const handleLocationSelect = () => {
    setHasRequestedLocation(true);
    onRequestLocationSelect?.();
    onOpenChange?.(false);
  };

  function handleSubmit(values: ReportFormValues) {
    onSubmit(values);
    onOpenChange?.(false);
    form.reset();
    setHasRequestedLocation(false);
  }

  useEffect(() => {
    if (open && hasRequestedLocation && initialLocation) {
      form.setValue("location", initialLocation);
    }
  }, [open, hasRequestedLocation, initialLocation, form]);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const hasLocation = Boolean(initialLocation) || Boolean(mapCenter);

  return (
    <Dialog
      open={isControlled ? open : undefined}
      onOpenChange={isControlled ? onOpenChange : undefined}
    >
      {trigger ?? (
        <Button
          variant="destructive"
          className="gap-2"
          asChild
          onClick={() => onOpenChange?.(true)}
        >
          <span>
            <Plus className="w-4 h-4" /> Report Incident
          </span>
        </Button>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>
            {hasLocation ? (
              <>
                Report an incident at{" "}
                <span className="font-mono">
                  {form.watch("location").latitude.toFixed(4)},{" "}
                  {form.watch("location").longitude.toFixed(4)}
                </span>
              </>
            ) : (
              "Please select a location on the map first"
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {!hasLocation && (
              <Button
                type="button"
                onClick={handleLocationSelect}
                className="w-full gap-2"
              >
                <MapPin className="w-4 h-4" />
                Select Location on Map
              </Button>
            )}

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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter incident title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a clear, concise title for the incident.
                  </FormDescription>
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
                  <FormDescription>
                    Include any relevant details about the incident.
                  </FormDescription>
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
                      <SelectItem value="medium">Medium Severity</SelectItem>
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

            {hasLocation && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      Location: {field.value.latitude.toFixed(4)},{" "}
                      {field.value.longitude.toFixed(4)}
                    </span>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange?.(false);
                  setHasRequestedLocation(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!hasLocation}
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
