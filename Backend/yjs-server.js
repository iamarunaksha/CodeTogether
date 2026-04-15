// ================================================
// Backend/yjs-server.js — Yjs WebSocket Server with Persistence
// ================================================

require('dotenv').config();

const { setupWSConnection } = require('y-websocket/bin/utils');

const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.YJS_PORT || 1234;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Yjs WebSocket Server is running.\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('Yjs client connected');
  setupWSConnection(ws, req);
});

server.listen(PORT, () => {
  console.log(`Yjs WebSocket server running on ws://localhost:${PORT}`);
  console.log(`Persistence: ${process.env.YPERSISTENCE ? 'LevelDB at ' + process.env.YPERSISTENCE : 'DISABLED (in-memory only)'}`);
});
