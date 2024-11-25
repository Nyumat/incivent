import app from "@/app";
import { connectDatabase } from "@/database";
import { config } from "dotenv";
import http from "http";
import "tsconfig-paths/register";
import WebSocket from "ws";

config({ path: ".env.local" });

const PORT = process.env.PORT || "3000";
const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI
    : process.env.LOCAL_MONGO_URI;

const startServer = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  await connectDatabase(MONGO_URI);

  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Client connected, total clients:", clients.size);

    ws.on("message", (message) => {
      try {
        const messageString = message.toString();
        const data = JSON.parse(messageString);

        console.log("Received message:", data);

        switch (data.type) {
          case "CHAT_MESSAGE": {
            const messageWithId = {
              ...data,
              message: {
                ...data.message,
                _id: crypto.randomUUID(),
              },
            };
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageWithId));
              }
            });
            break;
          }
          default: {
            clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(messageString);
              }
            });
          }
        }
      } catch (error) {
        console.error("Failed to process message:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected, total clients:", clients.size);
    });
  });

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  server.listen(parseInt(PORT), () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

(async () => {
  try {
    console.log("Starting server...");
    await startServer();

    process.on("SIGINT", () => {
      console.log("\nStopping server...");
      process.exit();
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
