let sockets = {
  execute: null,
  kill: null,
  inject: null,
};

let states = {
  execute: "closed",
  kill: "closed",
  inject: "closed",
};

// -------------------------
// EXECUTE SCRIPT
// -------------------------
function sendExecute() {
  if (!sockets.execute || sockets.execute.readyState !== WebSocket.OPEN) {
    log("[ERROR] Execute socket is not connected, please try again.");
    return;
  }

  sockets.execute.send(JSON.stringify({
    script: editor.getValue(),
    timestamp: Date.now()
  }));

  log("[SEND] Execute request sent");
}

// -------------------------
// INJECT SCRIPT
// -------------------------
function sendInject() {
  if (!sockets.inject || sockets.inject.readyState !== WebSocket.OPEN) {
    log("[ERROR] Inject Socket is not connected, please try again.");
    return;
  }

  sockets.inject.send(JSON.stringify({
    action: "inject",
    timestamp: Date.now()
  }));

  log("[INJECT] Injected request sent, waiting for status back");
}

// -------------------------
// KILL SCRIPT
// -------------------------
function sendKill() {
  if (!sockets.kill || sockets.kill.readyState !== WebSocket.OPEN) {
    log("[ERROR] Kill socket is not connected, please try again.");
    return;
  }

  sockets.kill.send(JSON.stringify({
    action: "kill",
    timestamp: Date.now()
  }));

  log("[KILL] Kill request sent");
}

// -------------------------
// STATUS HANDLING
// -------------------------
function updateStatus() {
  const values = Object.values(states);

  if (values.every(s => s === "open")) {
    setStatus("Connected", "green");
    return;
  }

  if (values.some(s => s === "connecting")) {
    setStatus("Connecting...", "yellow");
    return;
  }

  setStatus("Disconnected", "red");
}

// -------------------------
// MONACO EDITOR INIT
// -------------------------
let editor;

window.addEventListener("load", () => {
  require.config({
    paths: {
      vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs"
    }
  });

  require(["vs/editor/editor.main"], () => {

    monaco.editor.defineTheme("roblox-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "comment", foreground: "6A9955" },
        { token: "identifier", foreground: "DCDCDC" },
        { token: "delimiter", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editorLineNumber.foreground": "#858585",
        "editorCursor.foreground": "#AEAFAD",
        "editorIndentGuide.background": "#404040",
        "editorIndentGuide.activeBackground": "#707070",
        "editorLineNumber.activeForeground": "#C6C6C6",
      }
    });

    monaco.languages.register({ id: "lua" });

    monaco.languages.registerCompletionItemProvider("lua", {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: "print",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "print(${1:text})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "function",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "function ${1:name}(${2:args})\n\t${3:-- code}\nend",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "local function",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "local function ${1:name}(${2:args})\n\t${3:-- code}\nend",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "local",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "local ${1:name} = ${2:arg}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "for",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for ${1:index}, ${2:value} in ${3:method} do\n\t${4:--code}\nend",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "repeat",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "repeat\n\t${1:-- code}\nuntil ${2:condition}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "while",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "while ${1:condition} do\n\t${2:-- code}\nend",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "if",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "if ${1:condition} then\n\t${2:-- code}\nend",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: "if else",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "if ${1:condition} then\n\t${2:-- code}\nelse\n\t${3:-- else}\nend",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
        ]
      })
    });

    editor = monaco.editor.create(document.getElementById("editor"), {
      value: 'print("websitexploit.vercel.app")',
      language: "lua",
      theme: "roblox-dark",
      automaticLayout: true,
      fontSize: 16,
      fontFamily: "Consolas, 'JetBrains Mono', monospace",
      minimap: { enabled: false },
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      renderWhitespace: "none",
      renderLineHighlight: "line",
      wordWrap: "off",
      tabSize: 4,
      insertSpaces: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      folding: true,
      foldingHighlight: true,
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        highlightActiveIndentation: true
      }
    });
  });
});

// -------------------------
// LOGGING + UI
// -------------------------
function log(msg) {
  const logBox = document.getElementById("logs");
  if (!logBox) return;

  const p = document.createElement("p");
  p.textContent = msg;
  p.className = "text-gray-300";
  logBox.appendChild(p);
  logBox.scrollTop = logBox.scrollHeight;
}

function setStatus(text, color) {
  const label = document.getElementById("statusText");
  label.textContent = text;
}

function disconnectAll() {
  Object.values(sockets).forEach(ws => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  states.execute = "closed";
  states.kill = "closed";
  states.inject = "closed";

  updateStatus();
  log("[INFO] Disconnected manually");
}

// -------------------------
// BUTTON LISTENERS
// -------------------------

document.getElementById("connectBtn").addEventListener("click", () => {
  connectAll();
  Object.values(sockets).forEach(ws => {
    console.log("WebSocket state:", ws.readyState);
  });
});

document.getElementById("disconnectBtn").addEventListener("click", () => {
  disconnectAll(); // if you have one
});

document.getElementById("executeBtn").addEventListener("click", () => {
  const code = editor.getValue(); // Monaco editor content
  sockets.execute?.send(JSON.stringify({ script: code, timestamp: Date.now() }));
});

document.getElementById("injectBtn").addEventListener("click", () => {
  const code = editor.getValue();
  sockets.inject?.send(JSON.stringify({type: "inject"}));
});

document.getElementById("killBtn").addEventListener("click", () => {
  sockets.kill?.send(JSON.stringify({ kill: true }));
});



// -------------------------
// WEBSOCKET CONNECTIONS
// -------------------------
function connectRoute(name, route) {
  const port = document.getElementById("portInput").value.trim();
  if (!port) return log("[ERR] No port entered");

  states[name] = "connecting";
  updateStatus();

  const ws = new WebSocket(`ws://localhost:${port}${route}`);
  sockets[name] = ws;

  ws.onopen = () => {
    states[name] = "open";
    updateStatus();
    log(`[OK] Connected (${name})`);
  };

  ws.onerror = () => {
    states[name] = "closed";
    updateStatus();
    log(`[ERR] Error (${name})`);
  };

  ws.onclose = () => {
    states[name] = "closed";
    updateStatus();
    log(`[INFO] Disconnected (${name})`);
  };

  // ⭐ Inject-specific handler
  if (name === "inject") {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "injectResult") {
          log("[INJECT] Injection successful");
        }

        if (data.type === "error") {
          log("[ERROR] " + data.message);
        }

        console.log("Received:", data);

      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };
  }
  if (name === "execute") {
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "executeResult") {
            log("[EXECUTE] Execution successful")
          }

          if (data.type === "error") {
            log("[ERROR] " + data.message)
          }

          console.log("Recieved:", data)
      } catch (err) {
        console.error("Failed to parse message:", err)
      }
    }
    }
  if (name === "kill") {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "killResult") {
          log("[KILL] Kill successful")
        }

        if (data.type === "error") {
          log("[ERROR] " + data.message)
        }

        console.log("Recieved:", data)
      } catch (err) {
        console.error("Failed to parse message:", err)
      }
    }
  }
}

function connectAll() {
  connectRoute("execute", "/socket/execute");
  connectRoute("kill", "/socket/kill");
  connectRoute("inject", "/socket/inject");
}