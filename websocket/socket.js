import http from "http";
import { WebSocketServer } from "ws";

// Variables
const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

// Handle WSS Upgrades
server.on("upgrade", (req, socket, head) => {
    const path = requ.url;

    if (path === "/socket/execute") {
        wss.handleUpgrade(req, socket, head, ws =>{
            wss.route = "execute";
            wss.emit("connection");
        });
        return;
    }
    
    if (path === "/socket/inject") {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.route = "inject";
            wss.emit("connection");
        });
        return;
    }

    if(path === "/socket/kill") {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.route = "kill";
            wss.emit("connection");
        });
        return;
    }
});

wss.on("connection", (ws, req) => {
    console.log("[CONNECTED] Client is connected to route:", ws.route)

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
                }))
            }
        })

        console.log("[EXECUTE]\n" + JSON.stringify(data, null, 2));

        ws.send(JSON.stringify({
            type: "executeResult",
            message: "Execution complete",
        }));
        return
    };

    // /socket/inject
    if (ws.route === "inject") {
        ws.on("message", msg => {
            let data;

            try {
                data = JSON.parse(msg);
            } catch {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid JSON"
                }))
            }
        })

        console.log("[INJECT]\n" + JSON.stringify(data, null, 2));

        ws.send(JSON.stringify({
            type: "injectResult",
            message: "Injection complete",
        }));
        return
    }

    // /socket/kill
    if (ws.route === "kill") {
        ws.on("message", msg => {
            let data;

            try {
                data = JSON.parse(msg);
            } catch {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Invalid JSON"
                }))
            }
        })

        console.log("[KILL]\n" + JSON.stringify(data, null, 2));

        ws.send(JSON.stringify({
            type: "killResult",
            message: "Kill complete",
        }));
        return
    }
})

server.listen(8080, () => {
    console.log("[SERVER] Running on 8080")
})