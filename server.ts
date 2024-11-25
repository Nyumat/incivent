import "tsconfig-paths/register";
import app from "@/app";
import { connectDatabase } from "@/database";
import { config } from "dotenv";
import WebSocket from "ws";
import http from "http";

config({ path: ".env.local" });

const PORT = process.env.PORT || "3000";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const startServer = async (): Promise<void> => {
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
      console.log("Stopping server...");
      process.exit();
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
