import authRoutes from "@/routes/auth";
import incidentRoutes from "@/routes/incident";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.send("OK");
});

app.get("/", (req, res) => {
  res.send("Welcome to the API for Incivent!");
});

app.use("/api/auth", authRoutes);
app.use("/api", incidentRoutes);

export default app;
