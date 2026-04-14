// ================================================
// Backend/yjs-server.js — Yjs WebSocket Server with Persistence
// ================================================

// Load environment variables from .env
// This MUST be the very first line — before any other require()
// because y-websocket reads process.env.YPERSISTENCE during its import
require('dotenv').config();

// y-websocket provides a ready-made WebSocket server that speaks the Yjs protocol.
// IMPORTANT: When YPERSISTENCE is set, y-websocket automatically:
//   1. Creates a LevelDB database at the specified path
//   2. On room open: loads existing data from LevelDB into the Y.Doc
//   3. On every update: saves the incremental change to LevelDB
//   4. On room close (all clients leave): writes final state
// We don't need to write ANY persistence code ourselves!
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
  console.log(`🔄 Yjs WebSocket server running on ws://localhost:${PORT}`);
  console.log(`💾 Persistence: ${process.env.YPERSISTENCE ? 'LevelDB at ' + process.env.YPERSISTENCE : 'DISABLED (in-memory only)'}`);
});