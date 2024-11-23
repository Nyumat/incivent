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
import { useEffect } from "react";
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
}

export function ReportIncidentDialog({
  onSubmit,
  open,
  onOpenChange,
  initialLocation,
  trigger,
}: ReportIncidentDialogProps) {
  const defaultValues: Partial<ReportFormValues> = {
    type: "crime",
    title: "",
    description: "",
    severity: "medium",
    location: initialLocation ?? {
      latitude: 40.7128,
      longitude: -74.006,
    },
  };

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues,
  });

  // Update form location when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      form.setValue("location", initialLocation);
    }
  }, [initialLocation, form]);

  function handleSubmit(values: ReportFormValues) {
    onSubmit(values);
    onOpenChange?.(false);
    form.reset();
  }

  const isControlled = open !== undefined && onOpenChange !== undefined;

  return (
    <Dialog
      open={isControlled ? open : undefined}
      onOpenChange={isControlled ? onOpenChange : undefined}
    >
      {trigger ?? (
        <Button variant="destructive" className="gap-2" asChild>
          <span>
            <Plus className="w-4 h-4" /> Report Incident
          </span>
        </Button>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
          <DialogDescription>
            Report an incident at{" "}
            {form.watch("location") ? (
              <span className="font-mono">
                {form.watch("location").latitude.toFixed(4)},{" "}
                {form.watch("location").longitude.toFixed(4)}
              </span>
            ) : (
              "selected location"
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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

            {/* Hidden location field */}
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
