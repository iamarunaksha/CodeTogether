// ================================================
// Backend/index.js — Express Backend
// ================================================

// 1. IMPORT EXPRESS
// "require" is Node.js's way of importing libraries
// (similar to <script src="..."> in HTML, but for the server)
const express = require('express');

// 2. CREATE AN EXPRESS APPLICATION
// express() returns an "app" object with methods like .get(), .post(), .listen()
// Think of "app" as the web server
const app = express();

// 3. DEFINE A PORT
// Port 3001 means: "listen for requests on door number 3001"
// We use 3001 (not 3000) because React will use 3000
const PORT = 3001;

// 4. MIDDLEWARE: Parse JSON requests
// When the frontend sends data as JSON, Express needs to know how to read it
// This line says "hey Express, if someone sends you JSON, parse it into a JS object"
app.use(express.json());

// 5. DEFINE A ROUTE
// A "route" = a URL path + what to do when someone visits it
// app.get('/path', handlerFunction) means:
//   "When someone visits /path with a GET request, run this function"
//
// The function receives two parameters:
//   req (request)  = info about the incoming request (who's asking, what they sent)
//   res (response) = an object we use to send a response back
app.get('/', (req, res) => {
  res.json({ 
    message: 'CodeTogether API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 6. A second route — this will be useful later for health checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 7. START THE SERVER
// app.listen() starts the server and keeps it running
// It takes a port number and a callback function that runs once the server is ready
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});