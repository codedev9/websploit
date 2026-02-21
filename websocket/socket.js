process.on("uncaughtException", err => {
    console.error("UNCAUGHT ERROR:", err);
});

const http = require("http");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");


// Create HTTP server (Railway needs this)
const server = http.createServer((req, res) => { 
    res.writeHead(200); 
    res.end("WebSocket server is running"); 
});

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Handle upgrades
server.on("upgrade", (req, socket, head) => {
    const path = req.url.split("?")[0]
    if (path === "/socket/execute") {
        wss.handleUpgrade(req, socket, head, ws => {
            ws.route = "execute";
            wss.emit("connection", ws, req);
        });
        return;
    }
    if (path === "/socket/inject") {
        wss.handleUpgrade(req, socket, head, ws => {
            ws.route = "inject";
            wss.emit("connection", ws, req);
        });
        return;
    }
    if (path === "/socket/kill") {
        wss.handleUpgrade(req, socket, head, ws => {
            ws.route = "kill";
            wss.emit("connection", ws, req);
        });
        return;
    }
    socket.destroy();
});

// WebSocket connection handler
wss.on("connection", (ws, req) => {
    console.log("[CONNECTED] Client connected with route:", ws.route);

    // /socket/execute
    if (ws.route === "execute") {
    ws.on("message", msg => {
        let data;
        try {
            data = JSON.parse(msg);
        } catch {
            ws.send(JSON.stringify({
                type: "error",
                message: "Invalid JSON"
            }));
            return;
        }
        console.log("[EXECUTE]\n" + JSON.stringify(data, null, 2));

        ws.send(JSON.stringify({
            type: "executeResult",
            message: "Execution complete"
        }));
    });
    return;
    }
    if (ws.route === "inject") {
        ws.on("message", msg => {
            let data;
            try {
                data = JSON.parse(msg)
            } catch {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid JSON"
                }));
                return;
            }
            console.log("[INJECT]\n" + JSON.stringify(data, null, 2))
            ws.send(JSON.stringify({
                type: "injectionResult",
                message: "Injection complete"
            }));
        });
        return;
    }
    if (ws.route === "kill") {
        ws.on("message", msg => {
            let data;
            try {
                data = JSON.parse(msg)
            } catch {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid JSON"
                }))
                return;
            }
            console.log("[KILL]\n" + JSON.stringify(data, null, 2))
            ws.send(JSON.stringify({
                type: "killResult",
                message: "Kill complete"
            }));
        });
        return
    }
});

// Railway port fix
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
    console.log("[WEBSOCKET] WebSocket server running on port", PORT);
});