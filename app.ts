import authRoutes from "@/routes/auth";
import incidentRoutes from "@/routes/incident";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://dont-commit-crimes.vercel.app",
  })
);

app.get("/api/health", (req, res) => {
  res.send("OK");
});

app.get("/", (req, res) => {
  res.send("Welcome to the API for Incivent!");
});

app.use("/api/auth", authRoutes);
app.use("/api", incidentRoutes);

export default app;
