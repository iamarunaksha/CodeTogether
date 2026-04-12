// ================================================
// Backend/yjsServer.js — Yjs WebSocket Server
// ================================================

// y-websocket provides a ready-made WebSocket server that speaks the Yjs protocol.
// It handles:
//   - Receiving Yjs updates from any connected client
//   - Broadcasting those updates to all other clients in the same room
//   - Keeping an in-memory copy of the document state so late-joining
//     clients get the full current state immediately (not just future changes)
const { setupWSConnection } = require('y-websocket/bin/utils');

// We use Node's built-in 'http' and 'ws' (WebSocket) modules.
// 'ws' is a pure WebSocket library — much lighter than Socket.IO because
// we don't need Socket.IO's extra features (rooms, events) for Yjs.
const http = require('http');
const WebSocket = require('ws');

// PORT 1234 — the Yjs community convention for y-websocket.
// Our Express server stays on 3001. These two servers are completely independent.
const PORT = 1234;

// Create a plain HTTP server.
// y-websocket needs an HTTP server to "upgrade" connections to WebSocket.
// An HTTP connection starts as regular HTTP, then the client says
// "I want to upgrade this to a WebSocket connection" — and the server
// agrees. This is called the WebSocket "handshake".
const server = http.createServer((req, res) => {
  // This HTTP server only exists to support WebSocket upgrades.
  // If someone hits it with a plain HTTP request (like opening in a browser),
  // we just return a simple message.
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Yjs WebSocket Server is running.\n');
});

// Create a WebSocket server attached to our HTTP server.
// wss = WebSocket Secure (though in development it's just ws://)
// { server } means "attach to this existing HTTP server" — same upgrade trick
// as httpServer + Socket.IO in Phase 2.
const wss = new WebSocket.Server({ server });

// When a new WebSocket connection arrives:
// setupWSConnection is the magic function from y-websocket.
// It handles EVERYTHING: storing the document, syncing state, broadcasting updates.
// We just pass it the connection and the HTTP request. Done.
wss.on('connection', (ws, req) => {
  console.log('Yjs client connected');
  setupWSConnection(ws, req);
});

// Start listening on port 1234
server.listen(PORT, () => {
  console.log(`🔄 Yjs WebSocket server running on ws://localhost:${PORT}`);
});