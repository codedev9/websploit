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
            ws.emit("connection");
        });
        return;
    }
    if (path === "/socket/inject") {
        wss.handleUpgrade(req, socket, head, ws => {
            ws.route = "inject";
            ws.emit("connection");
        });
        return;
    }
    if (path === "/socket/kill") {
        wss.handleUpgrade(req, socket, head, ws => {
            ws.route = "kill";
            ws.emit("connection");
        });
        return;
    }
})

ws.on("connection", (ws, req) => {
    console.log("[CONNECTED] Client connected to server with route:", ws.route);
})