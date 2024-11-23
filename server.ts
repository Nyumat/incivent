import app from "@/app";
import { connectDatabase } from "@/database";
import { config } from "dotenv";

config({ path: ".env.local" });

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const startServer = async (): Promise<void> => {
  await connectDatabase(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

(async () => {
  try {
    console.log("Starting server...");
    await startServer();
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
