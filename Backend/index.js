// ================================================
// Backend/index.js — Express + Socket.IO Backend
// ================================================

// 1. IMPORTS
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// 2. CREATE EXPRESS APP
const app = express();

// 3. CREATE HTTP SERVER
// Express alone only handles HTTP. To add WebSockets, we need the raw
// HTTP server that Express sits on top of.
const httpServer = createServer(app);

// 4. CREATE SOCKET.IO SERVER
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Allow connections from React
    methods: ['GET', 'POST'],
  },
});

const PORT = 3001;

// 5. MIDDLEWARE
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================================================
// HTTP ROUTES
// ================================================

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the server health status and uptime
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ================================================
// ROOM ROUTES (Phase 5)
// ================================================

/**
 * @openapi
 * /api/rooms:
 *   post:
 *     summary: Create a new room
 *     description: Creates a new room and returns its ID
 *     tags:
 *       - Rooms
 *     responses:
 *       201:
 *         description: Room created successfully
 */
app.post('/api/rooms', (req, res) => {
  // In Phase 5, rooms are created client-side with UUID.
  // This endpoint exists for future use (Phase 7: database-backed rooms).
  // For now, we just acknowledge the creation.
  const { roomId } = req.body;
  console.log(`🏠 Room created: ${roomId}`);
  res.status(201).json({ roomId, created: new Date().toISOString() });
});

/**
 * @openapi
 * /api/rooms/{roomId}:
 *   get:
 *     summary: Get room info
 *     description: Returns information about a specific room
 *     tags:
 *       - Rooms
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room information
 */
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  res.json({
    roomId,
    status: 'active',
    message: 'Room is available for collaboration',
  });
});

// ================================================
// WEBSOCKET EVENTS
// ================================================

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for 'code-change' events from this client
  socket.on('code-change', (data) => {
    console.log(`Code change from ${socket.id}`);
    // socket.broadcast.emit sends it to ALL OTHER clients except this one
    socket.broadcast.emit('code-change', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ================================================
// START THE SERVER
// ================================================
// We must use httpServer.listen() instead of app.listen()
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket server ready on port ${PORT}`);
});