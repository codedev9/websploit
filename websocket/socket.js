import http from "http";
import { WebSocketServer } from "ws";

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

// Handle WebSocket upgrades
server.on("upgrade", (req, socket, head) => {
  const path = req.url;

  if (path === "/api/execute") {
    wss.handleUpgrade(req, socket, head, ws => {
      ws.route = "execute";
      wss.emit("connection", ws, req);
    });
    return;
  }

  if (path === "/api/inject") {
    wss.handleUpgrade(req,socket,head,ws => {
      ws.route = "inject"
      wss.emit("connection", ws, req)
    });
    return;
  }
  if (path === "/api/kill") {
    wss.handleUpgrade(req, socket, head, ws => {
      ws.route = "kill";
      wss.emit("connection", ws, req);
    });
    return;
  }
  socket.destroy();
});

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  console.log("Client connected to route:", ws.route);

  // /api/execute
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
        message: "Execution complete",
      }));
      return;
    });
  }
  // /api/inject
  if (ws.route === "inject") {
    ws.on("message", msg => {
      let data;

      try {
         data = JSON.parse(msg)
      } catch {
        ws.send(JSON.stringify({
          type: "error",
          message: "invalid JSON"
        }))
      }

      console.log("[INJECT]\n" + JSON.stringify(data, null, 2));

      ws.send(JSON.stringify({
        type: "injectResult",
        message: "injection successful",
      }));
      return;
    }) 
  }
  // /api/kill
  if (ws.route === "kill") {
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

      console.log("[KILL]\n" + JSON.stringify(data, null, 2));
      
      ws.send(JSON.stringify({
        type: "killResult",
        output: "Kill complete",
        received: data
      }));
      return;
    });
  }
});

// Start server
server.listen(8080, () => {
  console.log("WebSocket server running on port 8080");
});