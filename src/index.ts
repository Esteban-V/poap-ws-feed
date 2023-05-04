import * as dotenv from "dotenv";
dotenv.config();

import WebSocketServer from "ws";
import { init } from "./services/poap";

const wss = new WebSocketServer.Server({ port: 8080 });

// Creating connection using websocket
wss.on("connection", (ws: WebSocketServer) => {
  // handling client connection error
  ws.onerror = () => {
    console.log("Some Error occurred");
  };
});

init(wss);
