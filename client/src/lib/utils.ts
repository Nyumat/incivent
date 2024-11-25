import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface IChatMessage {
  _id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  incidentId?: string;
}

const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
export const wsUrl =
  process.env.NODE_ENV === "production"
    ? `wss://incivent.onrender.com`
    : `${wsProtocol}//${window.location.host}`;

export const BASE_URL = process.env.NODE_ENV === "production" ? "https://incivent.onrender.com" : "";