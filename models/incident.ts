import mongoose from "mongoose";

export type IncidentType = "crime" | "emergency" | "hazard";
export type IncidentSeverity = "low" | "medium" | "high";

export interface Incident extends mongoose.Document {
  id: number;
  type: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  severity: IncidentSeverity;
  reportedBy: mongoose.Types.ObjectId;
}

const incidentSchema = new mongoose.Schema<Incident>({
  id: { type: Number, required: true, unique: true },
  type: {
    type: String,
    enum: ["crime", "emergency", "hazard"],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: String, required: true },
  severity: { type: String, enum: ["low", "medium", "high"], required: true },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

export const IncidentModel = mongoose.model<Incident>(
  "Incident",
  incidentSchema
);
