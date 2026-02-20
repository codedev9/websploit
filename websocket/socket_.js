import http from "http";
import crypto from "crypto";
import { WebSocketServer } from "ws";

// Server Variables
const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

// Handle upgrades
server.on("upgrade", (req, socket, head) => {
    const path = req.url

    if (path === "/socket/execute") {
        wss.handleUpgrade(req, socket, head, ws => {
           ws.route = "execute";
           wss.emit("connection", ws, req);
        });

        return;
    }
    if (path === "/socket/inject") {
        wss.handleUpgrade(req, socket, head, wss => {
            ws.route = "inject";
            wss.emit("connection");
        });
        return;
    }
    if (path === "/socket/kill") {
        wss.handleUpgrade(req, socket, head, wss => {
            ws.route = "kill";
            wss.emit("connection");
        });
        return;
    }
})

wss.on("connection", (ws, req) => {
    console.log("[CONNECTED] Client connected to server with route:", ws.route);
})

server.listen(8080, () => {
    console.log("[STARTED] WebSocket server started on port 8080");
})