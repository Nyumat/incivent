import authRoutes from "@/routes/auth";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;
