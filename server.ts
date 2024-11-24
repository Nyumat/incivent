import app from "@/app";
import { connectDatabase } from "@/database";
import { config } from "dotenv";
import WebSocket from "ws";

config({ path: ".env.local" });

const PORT = process.env.PORT || "3000";
const WS_PORT = process.env.WS_PORT || "3001";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const startServer = async (): Promise<void> => {
  await connectDatabase(MONGO_URI);

  app.listen(parseInt(PORT), () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

const startWebSocketServer = async (): Promise<void> => {
  const wss = new WebSocket.Server({ port: parseInt(WS_PORT) });
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Client connected, total clients:", clients.size);

    ws.on("message", (message) => {
      try {
        const messageString = message.toString();
        const data = JSON.parse(messageString);

        console.log("Received message:", data);

        if (data.type === "NEW_INCIDENT" || data.type === "DELETE_INCIDENT") {
          clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(messageString);
            }
          });
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

  wss.on("listening", () => {
    console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
  });
};

(async () => {
  try {
    console.log("Starting server...");
    await startServer();

    console.log("Starting WebSocket server...");
    await startWebSocketServer();

    process.on("SIGINT", () => {
      console.log("Stopping server...");
      process.exit();
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
