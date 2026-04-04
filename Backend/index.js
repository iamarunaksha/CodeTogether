// ================================================
// Backend/index.js — Express Backend
// ================================================

// 1. IMPORT EXPRESS
const express = require('express');

// 2. IMPORT SWAGGER
// swaggerUi provides the interactive webpage
// swaggerSpec is the configuration we wrote in swagger.js
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// 3. CREATE AN EXPRESS APPLICATION
const app = express();

// 4. DEFINE A PORT
const PORT = 3001;

// 5. MIDDLEWARE: Parse JSON requests
app.use(express.json());

// 6. MOUNT SWAGGER UI
// This says: "When someone visits /api-docs, show them the Swagger UI"
// swaggerUi.serve = the static files (CSS, JS) needed to render the page
// swaggerUi.setup(swaggerSpec) = generate the page using our API spec
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================================================
// ROUTES
// ================================================

/**
 * @openapi
 * /:
 *   get:
 *     summary: API root
 *     description: Returns a welcome message confirming the API is running
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: CodeTogether API is running!
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   example: 2026-04-05T00:00:00.000Z
 */
app.get('/', (req, res) => {
  res.json({
    message: 'CodeTogether API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the server health status and uptime in seconds
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ================================================
// START THE SERVER
// ================================================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});