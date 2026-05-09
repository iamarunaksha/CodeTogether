# CodeTogether — Walkthroughs

> These walkthroughs document every step you've taken and will take. Refer back anytime.

---

# Phase 1: Environment Setup & "Hello World" Server ✅ COMPLETED

> **Your setup**: Node.js v25.6.1, npm 11.9.0, Git 2.50.1

## Actual Project Structure

```
Code Editor/                   ← Root project folder (your workspace)
├── Backend/                   ← Backend (Node.js + Express)
│   ├── index.js               ← Main server file
│   ├── package.json           ← Backend dependencies
│   └── package-lock.json
├── Frontend/                  ← Frontend (React + Vite + Tailwind v4)
│   ├── src/
│   │   ├── App.jsx            ← Main React component
│   │   ├── main.jsx           ← React entry point
│   │   └── index.css          ← Tailwind import
│   ├── index.html
│   ├── vite.config.js         ← Vite + Tailwind + Proxy config
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Git History
```
969d437 Housekeeping: fix folder structure, gitignore, and git config
7b7b786 Phase 1: Project setup with Express Backend and (React + Tailwind) Frontend
```

## Key Commands Learned
| Command | What it does |
|---------|-------------|
| `mkdir <name>` | Create a directory |
| `cd <path>` | Change into a directory |
| `npm init -y` | Create a package.json with defaults |
| `npm install <pkg>` | Install a dependency |
| `npm install --save-dev <pkg>` | Install a dev-only dependency |
| `npm run dev` | Run the dev script from package.json |
| `git init` | Start tracking a folder with Git |
| `git add .` | Stage all changes for commit |
| `git status` | See what's changed |
| `git commit -m "msg"` | Save a snapshot with a message |
| `git log --oneline` | See commit history (one line each) |

## How to Run (2 terminals needed)
```bash
# Terminal 1 — Backend
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Backend"
npm run dev
# → Server on http://localhost:3001

# Terminal 2 — Frontend
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Frontend"
npm run dev
# → App on http://localhost:5173
```

## Concepts Learned
1. **Node.js** = JavaScript running outside the browser (on your machine)
2. **npm** = Package manager (app store for code libraries)
3. **package.json** = Project ID card + dependency list
4. **Express** = Web framework for creating HTTP servers
5. **Routes** = URL paths mapped to handler functions (`app.get('/path', handler)`)
6. **Middleware** = Functions that run BEFORE your route handler (`app.use(...)`)
7. **Vite** = Fast build tool for React
8. **Tailwind CSS v4** = Utility-first CSS (`className="bg-gray-900 text-white"`)
9. **Proxy** = Forward `/api/*` requests from frontend to backend (avoids CORS)
10. **fetch()** = Make HTTP requests from JavaScript
11. **Git** = Version control — `init`, `add`, `commit`, `status`, `log`

---

# Phase 1.5: Adding Swagger to Backend ✅ COMPLETED

## What is Swagger?

**Swagger** (now called **OpenAPI**) is a tool that:
1. **Documents your API** — automatically generates a beautiful, interactive webpage listing all your routes
2. **Lets you test routes** — you can click "Try it out" and hit your API right from the browser
3. **Is industry standard** — every company from startups to FAANG uses it

Think of it like this: right now, the only way someone knows your API has a `/api/health` route is by reading your code. Swagger creates a live, interactive "menu" of all your routes at `http://localhost:3001/api-docs`. And we've set it up so visiting `http://localhost:3001` automatically redirects you there.

### What we're installing

| Package | What it does |
|---------|-------------|
| `swagger-ui-express` | Serves the interactive Swagger UI webpage |
| `swagger-jsdoc` | Reads special comments (JSDoc) in your code and generates the API spec from them |

## Step-by-Step

### 1 — Install the packages

Open a terminal and run:

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Backend"
npm install swagger-ui-express swagger-jsdoc
```

> **What this does**:
> - `swagger-ui-express` — Adds a `/api-docs` route that serves a beautiful interactive UI
> - `swagger-jsdoc` — Lets you write API docs as comments directly above your routes (instead of a separate YAML file)
> - Both get added to `"dependencies"` in your `package.json`

### 2 — Create a Swagger config file

We'll keep Swagger configuration in its own file to keep things organized. Create a new file:

```bash
touch swagger.js
```

Open `Backend/swagger.js` and paste:

```javascript
// ================================================
// Backend/swagger.js — Swagger (OpenAPI) Configuration
// ================================================

const swaggerJsdoc = require('swagger-jsdoc');

// This object describes your ENTIRE API at a high level
// Think of it as the "cover page" of your API documentation
const options = {
  definition: {
    openapi: '3.0.0',  // The OpenAPI version we're using (like saying "I'm writing in English v3")
    info: {
      title: 'CodeTogether API',             // Name shown at the top of the Swagger page
      version: '1.0.0',                      // Your API version
      description: 'API for the CodeTogether real-time collaborative code editor',
    },
    servers: [
      {
        url: 'http://localhost:3001',         // Where your API runs
        description: 'Development server',
      },
    ],
  },
  // This tells swagger-jsdoc WHERE to look for route documentation
  // It scans all .js files in the current directory for special /** comments */
  apis: ['./*.js'],
};

// Generate the specification object from our options
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
```

> **Key concept — `module.exports`**: In Node.js, each file is a "module". To share code between files, you use `module.exports` (to send) and `require()` (to receive). Here we're exporting `swaggerSpec` so that `index.js` can use it.

### 3 — Update index.js to use Swagger

Open `Backend/index.js` and replace the ENTIRE file with:

```javascript
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

// ROOT ROUTE — Redirect to Swagger docs
// res.redirect() sends the browser to a different URL
// So visiting localhost:3001 automatically opens the Swagger page
app.get('/', (req, res) => {
  res.redirect('/api-docs');
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
```

> **The `/** @openapi ... */` comments**: These are NOT regular comments. Swagger-jsdoc reads these special multi-line comments (called JSDoc) and uses them to generate the documentation. Each comment block describes:
> - **Which route** (`/api/health`)
> - **HTTP method** (`get`)
> - **Summary** and **description** (human-readable)
> - **Tags** (groups related routes together)
> - **Responses** (what the route returns, with examples)
>
> As you add more routes in future phases, you'll add these comment blocks above each one — and they'll automatically appear in Swagger UI.

### 4 — Test Swagger

```bash
npm run dev
```

Now open your browser and go to: **http://localhost:3001/api-docs**

You should see a beautiful interactive API documentation page with:
- A header saying "CodeTogether API"
- A "General" section with your two routes
- Click any route → click "Try it out" → click "Execute" → see the live response!

### 5 — Commit

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor"
git add .
git commit -m "Add Swagger API documentation to backend"
```

## New Concepts Learned

| Concept | What it means |
|---------|--------------|
| **Swagger / OpenAPI** | Industry standard for API documentation |
| **swagger-ui-express** | Serves an interactive docs page at `/api-docs` |
| **swagger-jsdoc** | Reads `@openapi` comments in your code to auto-generate docs |
| **JSDoc comments** | Special `/** */` comments that tools can parse |
| **module.exports / require** | How Node.js files share code with each other |
| **Tags** | Groups related routes in the Swagger UI |
| **res.redirect()** | Sends the browser to a different URL |

---

# Phase 2: WebSockets + Real-Time Connection ✅ COMPLETED

## Why Do We Need WebSockets?

In Phase 1, we built an HTTP server. HTTP works like **sending a letter**:

```
You (Browser) → Write a letter asking "How are you?"
               → Mail it to the server
               → Wait...
Server → Reads your letter
       → Writes a reply: "I'm healthy!"
       → Mails it back
You → Read the reply
     (conversation OVER — you can't talk again until you send another letter)
```

This is fine for loading pages. But imagine trying to have a **live conversation** by mail — you'd have to send a new letter every single second asking "did anyone type anything?" That's insanely inefficient.

**WebSockets** work like a **phone call**:

```
You (Browser) → Dial the server's number
Server → Picks up
Both → Can talk freely, anytime, in both directions
     → The line stays open until someone hangs up
```

This is exactly what we need for real-time collaborative editing — when User A types, User B should see it **instantly**, without having to ask "did anything change?"

### What is Socket.IO?

Raw WebSockets are powerful but low-level (like using assembly language). **Socket.IO** is a library that wraps WebSockets and adds:

| Feature | What it does |
|---------|-------------|
| **Auto-reconnection** | If your WiFi drops for 2 seconds, Socket.IO reconnects automatically |
| **Fallback** | If WebSockets aren't supported (rare), it falls back to HTTP long-polling |
| **Rooms** | You can group connections together — we'll use this for coding rooms in Phase 5 |
| **Named events** | Instead of sending raw bytes, you send named events like `"code-change"` with structured data |

Think of Socket.IO as WebSockets with training wheels AND superpowers.

## What we're installing

| Package | Where | What it does |
|---------|-------|-------------|
| `socket.io` | Backend | The Socket.IO **server** — listens for WebSocket connections |
| `socket.io-client` | Frontend | The Socket.IO **client** — connects FROM the browser |

> **Why are they separate packages?** The server and client are completely different programs. The server manages potentially thousands of connections; the client manages just one. They need different code, so they're shipped as different npm packages.

## Step-by-Step

### 1 — Install Socket.IO on the Backend

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Backend"
npm install socket.io
```

> **What this does**: Adds `socket.io` to your `Backend/package.json` dependencies. This is the server-side library that will listen for WebSocket connections on port 3001 (alongside your HTTP routes).

### 2 — Install Socket.IO Client on the Frontend

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Frontend"
npm install socket.io-client
```

> **What this does**: Adds `socket.io-client` to your `Frontend/package.json` dependencies. This is the browser-side library that your React app uses to connect to the server's WebSocket.

### 3 — Update `Backend/index.js`

This is the big change. We need to wrap our Express app in an HTTP server so that Socket.IO can attach to it. Open `Backend/index.js` and replace the ENTIRE file with:

```javascript
// ================================================
// Backend/index.js — Express + Socket.IO Backend
// ================================================

// 1. IMPORTS
const express = require('express');             // Web framework (same as before)
const { createServer } = require('http');       // Node.js built-in HTTP module
const { Server } = require('socket.io');        // Socket.IO server class
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// 2. CREATE EXPRESS APP (same as before)
const app = express();

// 3. CREATE HTTP SERVER
// WHY? In Phase 1, we used app.listen() which secretly creates an HTTP server
// behind the scenes. But now we need ACCESS to that HTTP server so we can
// attach Socket.IO to it. So we create it explicitly ourselves.
//
// Think of it like this:
//   httpServer = the BUILDING (handles all network traffic)
//   app (Express) = the FRONT DESK (handles HTTP requests like /api/health)
//   io (Socket.IO) = the INTERCOM SYSTEM (handles WebSocket connections)
//   Both the front desk and intercom live inside the same building.
const httpServer = createServer(app);

// 4. CREATE SOCKET.IO SERVER
// We attach it to the SAME httpServer, so HTTP routes and WebSockets
// both work on port 3001.
//
// cors: Cross-Origin Resource Sharing — a security rule in browsers.
// Our React app runs on port 5173, but the server is on port 3001.
// By default, browsers BLOCK requests between different ports (for security).
// This cors config says "it's OK, allow connections from port 5173."
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',  // Allow our React frontend
    methods: ['GET', 'POST'],         // Allow these HTTP methods
  },
});

const PORT = 3001;

// 5. MIDDLEWARE (same as before)
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================================================
// HTTP ROUTES (same as before — these haven't changed)
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
// WEBSOCKET EVENTS (this is the NEW stuff!)
// ================================================

// io.on('connection', callback) — this runs EVERY TIME a new client connects.
// Think of it like a doorbell: every time someone opens your app in a new tab,
// this function fires. The `socket` parameter represents THAT specific person's
// connection — like their personal walkie-talkie channel.
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  // socket.id is a unique ID that Socket.IO assigns to each connection.
  // It looks like "abc123def456" — useful for identifying who sent what.

  // EVENT: 'code-change'
  // This fires when a user types something and the frontend sends a 'code-change' event.
  // We then BROADCAST it to everyone else.
  //
  // socket.broadcast.emit = "send this to ALL connected clients EXCEPT the one who sent it"
  // Why "except"? Because the sender already sees what they typed — we don't want to
  // send it back to them (that would cause duplicate text or infinite loops).
  socket.on('code-change', (data) => {
    console.log(`Code change from ${socket.id}`);
    socket.broadcast.emit('code-change', data);
  });

  // EVENT: 'disconnect'
  // This fires when a client disconnects — they close the tab, lose internet, etc.
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ================================================
// START THE SERVER
// ================================================
// IMPORTANT CHANGE: We use httpServer.listen() instead of app.listen()
// Because Socket.IO is attached to httpServer. If we used app.listen(),
// Express would create its OWN HTTP server — and Socket.IO wouldn't be on it.
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket server ready on port ${PORT}`);
});
```

> **Socket.IO Methods Cheat Sheet:**
>
> | Method | What it does | Analogy |
> |--------|-------------|---------|
> | `io.on('connection', callback)` | Runs when ANY client connects | Doorbell rings |
> | `socket.on('event-name', callback)` | Listens for event from THIS client | "If this person says X, do Y" |
> | `socket.emit('event-name', data)` | Sends to THIS client only | Whisper to one person |
> | `socket.broadcast.emit('event-name', data)` | Sends to ALL clients EXCEPT sender | Announce to the room, but not the speaker |
> | `io.emit('event-name', data)` | Sends to ALL clients INCLUDING sender | PA system announcement |

### 4 — Update `Frontend/src/App.jsx`

Now let's make the React frontend connect to the WebSocket server. Open `Frontend/src/App.jsx` and replace the ENTIRE file with:

```jsx
// We need 3 React hooks now:
// useState — for data that causes re-renders (UI updates)
// useEffect — for code that runs after component mounts (connecting to server)
// useRef — for values that persist across re-renders WITHOUT causing re-renders
import { useState, useEffect, useRef } from 'react';

// Import the Socket.IO client library
// io() is a function that creates a WebSocket connection to a server
import { io } from 'socket.io-client';

function App() {
  // ---- STATE (these cause re-renders when they change) ----
  const [backendStatus, setBackendStatus] = useState('checking');
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [text, setText] = useState('');   // The text in our textarea

  // ---- REFS (these persist across re-renders WITHOUT causing re-renders) ----

  // Why useRef instead of useState for the socket?
  // If we used useState, every time we stored the socket it would cause a
  // re-render. That re-render would re-run the component, potentially creating
  // a NEW socket connection. useRef gives us a "box" to store the socket in
  // that React doesn't watch or re-render for.
  const socketRef = useRef(null);

  // This flag tracks whether a text change came from the SERVER (another user)
  // or from the USER typing locally. We need this to prevent an infinite loop:
  //   User types → emit to server → server broadcasts → we receive → setText()
  //   → handleTextChange fires → emit to server again → infinite loop!
  // By checking isRemoteChange, we break the loop.
  const isRemoteChange = useRef(false);

  // useEffect with [] = runs ONCE when the component first appears on screen.
  // This is where we set up our connections.
  useEffect(() => {
    // ---- CHECK HTTP BACKEND (same as Phase 1) ----
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // ---- CONNECT TO WEBSOCKET ----
    // io('url') creates a WebSocket connection to the server.
    // It returns a 'socket' object that we use to send/receive events.
    const socket = io('http://localhost:3001');
    socketRef.current = socket;  // Store it in our ref so we can use it later

    // EVENT: 'connect' — fires when the WebSocket connection is established
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id);
      setSocketStatus('connected');
    });

    // EVENT: 'code-change' — fires when ANOTHER user types something
    // The server broadcasts their changes to us, and we update our textarea.
    socket.on('code-change', (data) => {
      console.log('📨 Received code change');
      isRemoteChange.current = true;   // Flag: this change is from the server
      setText(data.content);           // Update our textarea with their text
    });

    // EVENT: 'disconnect' — fires when we lose connection to the server
    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setSocketStatus('disconnected');
    });

    // CLEANUP FUNCTION
    // React calls this function when the component is removed from the screen
    // (or when the page is closed). We disconnect the socket to be a good citizen
    // and not leave zombie connections on the server.
    return () => socket.disconnect();
  }, []);

  // ---- HANDLE TEXT CHANGES ----
  // This runs every time the user types in the textarea.
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);                    // Update React state (causes re-render)

    // Only emit to server if the USER typed it (not if it came from server).
    // The ?. is "optional chaining" — if socketRef.current is null, it just
    // does nothing instead of throwing an error.
    if (!isRemoteChange.current) {
      socketRef.current?.emit('code-change', { content: newText });
    }
    isRemoteChange.current = false;      // Reset the flag for next time
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header with status badges */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">CodeTogether</h1>
        <div className="flex gap-3">
          {/* API status badge — green if HTTP backend is running */}
          <div className={`px-3 py-1 rounded-full text-sm ${
            backendStatus === 'connected'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {backendStatus === 'connected' ? '● API' : '○ API'}
          </div>
          {/* WebSocket status badge — green if real-time connection is active */}
          <div className={`px-3 py-1 rounded-full text-sm ${
            socketStatus === 'connected'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {socketStatus === 'connected' ? '● Live' : '○ Connecting...'}
          </div>
        </div>
      </header>

      {/* Main editor area — this textarea will be replaced by Monaco in Phase 3 */}
      <main className="flex-1 p-6 flex flex-col gap-4">
        <div className="text-gray-400 text-sm">
          Open this page in another browser tab and start typing — changes sync in real-time!
        </div>

        <textarea
          value={text}
          onChange={handleTextChange}
          className="flex-1 bg-gray-800 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-700 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Start typing here... It will sync to other tabs in real-time!"
          spellCheck={false}
        />
      </main>

      {/* Status bar at the bottom — styled like VS Code's blue bar */}
      <footer className="bg-blue-600 px-4 py-1 flex items-center justify-between text-white text-xs">
        <span>WebSocket: {socketStatus}</span>
        <span>Phase 2: Real-time Sync Demo</span>
      </footer>
    </div>
  );
}

export default App;
```

### 5 — Update `Frontend/vite.config.js`

We need to tell Vite to also proxy WebSocket connections to our backend. Open `Frontend/vite.config.js` and replace with:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* requests to the backend (same as Phase 1)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // NEW: Forward /socket.io/* requests to the backend
      // Without this, the browser would try to connect to port 5173 for WebSockets
      // and fail because Vite doesn't know about Socket.IO.
      // ws: true tells Vite "this isn't just HTTP — forward WebSocket upgrade
      // requests too." A WebSocket connection starts as an HTTP request and then
      // "upgrades" to a persistent connection — ws: true handles that upgrade.
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
```

### 6 — Test It!

1. Make sure both Backend and Frontend are running (`npm run dev` in each)
2. Open **TWO browser tabs** both pointing to `http://localhost:5173`
3. Type in one tab → See the text appear instantly in the other tab!
4. Check your Backend terminal — you should see connection logs

### 7 — Commit

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor"
git add .
git commit -m "Phase 2: WebSocket real-time sync with Socket.IO"
git push
```

## How the Data Flows (The Full Picture)

```
Tab 1 types "hello"
    │
    ▼
App.jsx handleTextChange()
    │
    ├─ setText("hello")              → Updates Tab 1's textarea
    │
    └─ socket.emit('code-change', { content: "hello" })
           │
           ▼
    Backend receives 'code-change' event
           │
           └─ socket.broadcast.emit('code-change', { content: "hello" })
                  │                    ↑
                  │      "send to everyone EXCEPT the sender"
                  ▼
           Tab 2 receives 'code-change' event
                  │
                  ├─ isRemoteChange.current = true   (flag: don't re-emit!)
                  └─ setText("hello")     → Updates Tab 2's textarea
```

## New Concepts Learned

| Concept | What it means |
|---------|--------------|
| **WebSockets** | Persistent two-way connection between browser and server (phone call, not letters) |
| **Socket.IO** | Library that wraps WebSockets with auto-reconnection, rooms, and named events |
| **`socket.on('event', cb)`** | Listen for a named event from the server/client |
| **`socket.emit('event', data)`** | Send a named event with data to the server/client |
| **`socket.broadcast.emit()`** | Send to ALL connected clients EXCEPT the sender |
| **`io.on('connection')`** | Runs on the server every time a new client connects |
| **`useRef`** | React hook that stores a value across re-renders WITHOUT causing re-renders |
| **`createServer(app)`** | Wraps Express in a raw HTTP server so Socket.IO can attach to it |
| **CORS** | Cross-Origin Resource Sharing — browser security rule for cross-port connections |
| **`ws: true`** | Vite proxy option to forward WebSocket upgrade requests |
| **Optional chaining `?.`** | `obj?.method()` — calls method only if obj isn't null/undefined |
| **Cleanup function** | `return () => ...` in useEffect — runs when component unmounts |

---

# Phase 3: Monaco Editor — The VS Code Heart

## What is Monaco Editor?

You know VS Code — the editor you're writing code in right now? **Monaco Editor is VS Code's beating heart**. It's the actual code editing engine that Microsoft extracted from VS Code and released as a standalone library that anyone can embed in a webpage.

When you use Monaco, you're not getting a cheap imitation — you're getting **the real thing**:
- The same syntax highlighting
- The same autocomplete (IntelliSense)
- The same keyboard shortcuts (Ctrl+D, Ctrl+Shift+K, etc.)
- The same minimap on the right side
- The same find & replace
- Support for 50+ programming languages

Right now, our app has a basic `<textarea>` — it's like writing code in Notepad. After this phase, it'll look and feel like VS Code.

### What we're installing

| Package | What it does |
|---------|-------------|
| `@monaco-editor/react` | A React wrapper around Monaco Editor. It handles all the complex setup (loading Monaco's web workers, managing the editor lifecycle) so we just use a simple `<Editor />` component. |

> **Why `@monaco-editor/react` instead of raw `monaco-editor`?**
> Raw `monaco-editor` requires complex Webpack configuration to load its web workers (background threads that handle syntax parsing). The `@monaco-editor/react` package handles all of that automatically — it loads Monaco from a CDN and gives us a clean React component. Zero config needed.

## Step-by-Step

### 1 — Install the Monaco Editor React package

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Frontend"
npm install @monaco-editor/react
```

> **What this does**: Installs the React wrapper for Monaco Editor. It will automatically download the Monaco Editor from a CDN when your app loads — no additional Webpack or Vite config needed!

### 2 — Create a CodeEditor component

We're going to create a dedicated component for the editor. Why? Because it keeps your code organized — `App.jsx` handles layout and connections, while `CodeEditor.jsx` handles everything about the code editor itself.

Create a new file at `Frontend/src/components/CodeEditor.jsx`:

```bash
mkdir -p src/components
```

Then open `Frontend/src/components/CodeEditor.jsx` and paste:

```jsx
// ================================================
// Frontend/src/components/CodeEditor.jsx
// ================================================

// Import the Monaco Editor React component
// This is the main component that renders the VS Code editor
import Editor from '@monaco-editor/react';

// We receive these as "props" (inputs) from the parent component (App.jsx):
//   value     = the current code text
//   onChange  = a function to call when the user types something
//   language  = which programming language to use for syntax highlighting
function CodeEditor({ value, onChange, language = 'javascript' }) {

  // This function fires every time the user types in the editor.
  // Monaco gives us the new value directly (not an event object like <textarea>).
  // So instead of e.target.value, we just get the string.
  const handleEditorChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Editor
      // height="100%" makes the editor fill its parent container
      height="100%"

      // The programming language — this controls syntax highlighting.
      // Monaco supports: javascript, typescript, python, html, css, json,
      // markdown, sql, java, cpp, csharp, go, rust, and 40+ more.
      language={language}

      // The current text content of the editor
      value={value}

      // The VS Code color theme. Options include:
      //   'vs'       — light theme (white background)
      //   'vs-dark'  — dark theme (the classic VS Code dark)
      //   'hc-black' — high contrast (for accessibility)
      theme="vs-dark"

      // Called every time the user types
      onChange={handleEditorChange}

      // Editor options — these configure how the editor looks and behaves.
      // These are the SAME options you'd set in VS Code's settings.json!
      options={{
        // Font settings
        fontSize: 14,                    // Font size in pixels
        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        fontLigatures: true,             // Enable ligatures (=> becomes →, etc.)

        // Editor behavior
        minimap: { enabled: true },      // The code preview strip on the right
        scrollBeyondLastLine: false,     // Don't scroll past the last line
        wordWrap: 'on',                  // Wrap long lines instead of horizontal scroll
        automaticLayout: true,           // Auto-resize when window changes
        tabSize: 2,                      // 2 spaces per tab (industry standard for JS)

        // UI enhancements
        lineNumbers: 'on',              // Show line numbers on the left
        renderLineHighlight: 'line',    // Highlight the current line
        cursorBlinking: 'smooth',       // Smooth cursor blink animation
        cursorSmoothCaretAnimation: 'on', // Smooth cursor movement
        smoothScrolling: true,          // Smooth scrolling

        // Bracket matching
        bracketPairColorization: {
          enabled: true,                 // Color-code matching brackets
        },

        // Padding at the top of the editor (looks cleaner)
        padding: { top: 16 },
      }}
    />
  );
}

export default CodeEditor;
```

> **Key concept — Component Props**:
> In React, **props** are like function arguments. When `App.jsx` uses `<CodeEditor value={text} onChange={handleChange} />`, it's passing `text` and `handleChange` as inputs to the CodeEditor component. Inside CodeEditor, we access them as `{ value, onChange }`.
>
> The `language = 'javascript'` syntax is a **default value** — if App.jsx doesn't pass a language prop, it defaults to JavaScript.

### 3 — Update `Frontend/src/App.jsx`

Now we replace the `<textarea>` with our new Monaco Editor component. Open `Frontend/src/App.jsx` and replace the ENTIRE file with:

```jsx
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import CodeEditor from './components/CodeEditor';  // Our new Monaco component!

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [code, setCode] = useState('// Welcome to CodeTogether!\n// Start typing — your code syncs in real-time.\n\nfunction hello() {\n  console.log("Hello, world!");\n}\n');

  // NEW: Track the current language for syntax highlighting
  const [language, setLanguage] = useState('javascript');

  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    // Check HTTP backend
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // Connect to WebSocket
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id);
      setSocketStatus('connected');
    });

    socket.on('code-change', (data) => {
      console.log('📨 Received code change');
      isRemoteChange.current = true;
      setCode(data.content);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setSocketStatus('disconnected');
    });

    return () => socket.disconnect();
  }, []);

  // UPDATED: Monaco gives us the value directly (not an event object)
  // So this is simpler than the textarea version
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (!isRemoteChange.current) {
      socketRef.current?.emit('code-change', { content: newCode });
    }
    isRemoteChange.current = false;
  };

  // List of languages the user can pick from
  const languages = [
    'javascript', 'typescript', 'python', 'html', 'css',
    'json', 'markdown', 'java', 'cpp', 'csharp', 'go', 'rust', 'sql',
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">CodeTogether</h1>

          {/* Language selector dropdown */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className={`px-3 py-1 rounded-full text-sm ${
            backendStatus === 'connected'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {backendStatus === 'connected' ? '● API' : '○ API'}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            socketStatus === 'connected'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {socketStatus === 'connected' ? '● Live' : '○ Connecting...'}
          </div>
        </div>
      </header>

      {/* Editor area — Monaco fills this entire space */}
      <main className="flex-1 overflow-hidden">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language={language}
        />
      </main>

      {/* Status bar (VS Code style) */}
      <footer className="bg-blue-600 px-4 py-1 flex items-center justify-between text-white text-xs">
        <div className="flex gap-4">
          <span>WebSocket: {socketStatus}</span>
        </div>
        <div className="flex gap-4">
          <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
```

> **What changed from Phase 2:**
>
> | What | Before (Phase 2) | After (Phase 3) |
> |------|------------------|-----------------|
> | Editor | `<textarea>` — plain text, no highlighting | `<CodeEditor />` — full VS Code editor |
> | State variable | `text` | `code` (renamed to be more descriptive) |
> | Change handler | `e.target.value` | Monaco gives the value directly as a string |
> | Default content | Empty string | Sample JavaScript code so you see highlighting immediately |
> | Language | None | Dropdown to switch between JavaScript, Python, etc. |
> | Status bar | Just WebSocket status | Language, encoding, and tab size (like real VS Code) |
> | Layout | `min-h-screen` with padding | `h-screen` without padding — editor fills the entire window |

### 4 — Test It!

1. Make sure both Backend and Frontend are running (`npm run dev` in each)
2. Open `http://localhost:5173` — you should see a full VS Code-style editor!
3. Try these things:
   - **Type some code** — notice syntax highlighting, bracket matching, and autocomplete
   - **Change the language** — use the dropdown to switch to Python, HTML, etc.
   - **Press Ctrl+D** — selects the next occurrence (same as VS Code!)
   - **Press Ctrl+/** — toggles comments (same as VS Code!)
   - **Open two tabs** — type in one, see it sync to the other
   - **Look at the minimap** — the preview on the right side, just like VS Code

### 5 — Commit

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor"
git add .
git commit -m "Phase 3: Monaco Editor with syntax highlighting and language selector"
git push
```

## Updated Project Structure

```
Code Editor/
├── Backend/
│   ├── index.js               ← Express + Socket.IO server
│   ├── swagger.js             ← Swagger configuration
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CodeEditor.jsx ← NEW! Monaco Editor component
│   │   ├── App.jsx            ← Updated with Monaco + language selector
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── Documentation/
│   └── Walkthroughs.md
├── .gitignore
└── README.md
```

## New Concepts Learned

| Concept | What it means |
|---------|--------------|
| **Monaco Editor** | The actual editor engine extracted from VS Code — same highlighting, shortcuts, and features |
| **`@monaco-editor/react`** | A React wrapper that makes Monaco easy to use — loads from CDN, zero config |
| **Component Props** | Inputs passed to a React component — like function arguments (`{ value, onChange, language }`) |
| **Default Props** | `language = 'javascript'` — use this value if the parent doesn't pass one |
| **`<select>` + `<option>`** | HTML dropdown menu — we use it to let users pick the programming language |
| **`automaticLayout: true`** | Monaco option that auto-resizes the editor when the browser window changes |
| **`bracketPairColorization`** | Color-codes matching brackets so you can see which `{` goes with which `}` |
| **`h-screen` vs `min-h-screen`** | `h-screen` = exactly viewport height; `min-h-screen` = at least viewport height |
| **`overflow-hidden`** | Prevents scrollbars from appearing on the parent — Monaco handles its own scrolling |

---

# Phase 4: Real-Time Collaboration with Yjs (CRDT)

## ⚠️ The Problem with Our Current Approach

Before we start, I need to show you why your current Socket.IO sync is fundamentally broken for real multi-user collaboration. This is important to understand — it'll make Yjs click in your mind.

**Try this mental experiment:**

```
Your current code editor has text: "Hello"
User A is at position 5, User B is at position 5
Both type at the EXACT same time:

User A types: "World" → sent to server
User B types: "Foo"   → sent to server

Server broadcasts "World" to User B → User B's editor becomes "HelloWorld"
Server broadcasts "Foo" to User A   → User A's editor becomes "HelloFoo"

FINAL STATE:
- User A sees: "HelloFoo"      ← User B's "Foo" OVERWROTE their text
- User B sees: "HelloWorld"   ← User A's "World" OVERWROTE their text

WHO WINS? Whoever's message arrived last. The other person's text is LOST FOREVER.
```

This is called a **conflict**. Your current `socket.broadcast.emit()` approach has no mechanism to resolve conflicts — it just overwrites. Every collaborative editor that matters (Google Docs, Notion, Figma) solves this problem. We're about to do the same.

### Why "last write wins" is unacceptable

| Scenario | What happens | Why it's bad |
|----------|-------------|-------------|
| Both type simultaneously | Last message overwrites | Someone's work is lost |
| Slow connection | Earlier edits get lost | Users feel like their typing "disappears" |
| Offline then reconnect | All offline edits overwritten | Completely breaks offline-first |
| Many users | Chaos — everyone's overwriting everyone | Not collaborative at all |

---

## The Solution: CRDT (Conflict-free Replicated Data Types)

Instead of sending **the entire text** back and forth (like we do now), we need to send **individual operations** — "insert this character at position 5", "delete 3 characters at position 10", etc.

**Think of it like Google Docs' "suggestions mode":**

```
Instead of:  "Here is my full document" (overwrite everything)
We send:     "Insert 'ello' at position 1"  (a tiny operation)
             "Insert ' World' at position 5" (another tiny operation)

Each operation has a unique ID and a timestamp.
When two operations conflict, the CRDT algorithm MERGES them — no data is lost.
```

### CRDT in Plain English

CRDT stands for **Conflict-free Replicated Data Type**. Think of it like this:

- **Traditional approach**: Two people edit a shared Google Doc by sending the entire document back and forth — whoever types last wins.
- **CRDT approach**: Two people edit a shared Google Doc by sending individual keystrokes. Each keystroke is labeled with who made it and when. When the keystrokes arrive, they're merged automatically by mathematical rules — no human needed to resolve conflicts.

The key insight: **CRDTs don't need a central server to decide who wins.** The merge rules are built into the data structure itself. The server just relays operations — it never needs to "resolve" anything.

### Why Yjs instead of OT (Operational Transform)?

You mentioned you chose Yjs over OT — great choice. Here's why:

| | OT (Operational Transform) | Yjs (CRDT) |
|---|---|---|
| Complexity | Very hard to implement correctly | Much simpler — Yjs handles the hard parts |
| Server dependency | Needs a central server to resolve conflicts | Works peer-to-peer, server is optional |
| Monaco support | You'd build it yourself | `y-monaco` — ready-made binding exists |
| Used by | Google Docs (100+ engineers) | Many modern collaborative editors |
| Offline support | Very hard | Built-in — merge on reconnect |

---

## What We're Installing

| Package | Where | What it does |
|---------|-------|-------------|
| `yjs` | Both | The CRDT core — handles conflict-free merging of text operations |
| `y-websocket` | Backend | A WebSocket provider for Yjs — syncs CRDT state over the network |
| `y-monaco` | Frontend | Binds Yjs to Monaco Editor — makes Monaco CRDT-aware |
| `y-codemirror.next` | Frontend | A React hook (`useYjs`, `useSyncedCursor`) for easy integration |

---

## Architecture: How It All Fits Together

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER 1 (User A)                   │
│  Monaco Editor                                               │
│       │                                                      │
│       ▼                                                      │
│  y-monaco (binds Monaco ↔ Yjs)                              │
│       │                                                      │
│       ▼                                                      │
│  Y.Doc (the CRDT document — lives in browser memory)         │
│       │                                                      │
│       ▼                                                      │
│  y-websocket provider (sends Y.Doc updates over WebSocket)  │
└─────────────────────────────────────────────────────────────┘
                           │
                    WebSocket (port 3001)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js)                    │
│  y-websocket server (receives updates, broadcasts to others) │
└─────────────────────────────────────────────────────────────┘
                           │
                    WebSocket
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER 2 (User B)                   │
│  (same chain in reverse)                                     │
└─────────────────────────────────────────────────────────────┘
```

**Key insight**: Instead of `socket.emit('code-change', { content: "..." })` sending the entire editor text, we now send **tiny CRDT operations** (insert character X at position Y, delete Z characters at position W). These are small, atomic, and mergeable.

---

## Step-by-Step

### Step 1 — Install Yjs packages on the Backend

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Backend"
npm install yjs y-websocket
```

> **What this does**:
> - `yjs` — The CRDT library itself. Gives us `Y.Doc` (the document), `Y.Text` (the text type within the document), and the merge engine.
> - `y-websocket` — A WebSocket utility for Yjs. On the server side, it sets up a WebSocket room manager that broadcasts CRDT updates to all connected clients.

### Step 2 — Install Yjs packages on the Frontend

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Frontend"
npm install yjs y-websocket y-monaco y-codemirror.next
```

> **What this does**:
> - `yjs` — Same CRDT library on the client side.
> - `y-websocket` — Client-side WebSocket provider that connects to the backend's y-websocket server.
> - `y-monaco` — The binding layer between Monaco Editor and Yjs. It makes Monaco Editor "CRDT-aware" — every keystroke becomes a Yjs operation instead of a direct text change.
> - `y-codemirror.next` — Utility library with React hooks that make it easy to use Yjs with Monaco in a React app.

### Step 3 — Update `Backend/index.js`

This is the most important change. We replace our manual Socket.IO event broadcasting with y-websocket's built-in room management. Open `Backend/index.js` and replace the ENTIRE file:

```javascript
// ================================================
// Backend/index.js — Express + y-websocket Backend
// ================================================

// 1. IMPORTS
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// 2. Yjs WebSocket imports
const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

// 3. CREATE EXPRESS APP
const app = express();

// 4. CREATE HTTP SERVER
const httpServer = createServer(app);

// 5. CREATE SOCKET.IO SERVER (for future use: rooms, user presence)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// 6. CREATE Y-WEBSOCKET SERVER
// This is SEPARATE from Socket.IO. Yjs has its own WebSocket protocol.
// We create a raw Node.js WebSocket server (using the 'ws' package) and
// attach it to the same httpServer on a DIFFERENT PATH.
const ywss = new WebSocketServer({ noServer: true });

// setupWSConnection does all the heavy lifting:
// - Manages Y.Doc instances per room
// - Syncs CRDT updates between all connected clients
// - Handles reconnection and initial state
ywss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

// 7. HANDLE HTTP UPGRADE REQUESTS
// When a WebSocket connection comes in on /yjs, pass it to ywss.
// When it comes in on anything else, pass it to Socket.IO.
httpServer.on('upgrade', (request, socket, head) => {
  // Extract the path from the URL
  const url = new URL(request.url, `http://${request.headers.host}`);
  
  if (url.pathname === '/yjs') {
    // y-websocket handles this connection
    ywss.handleUpgrade(request, socket, head, (ws) => {
      ywss.emit('connection', ws, request);
    });
  } else {
    // Socket.IO handles this connection
    io.handleUpgrade(request, socket, head, (ws) => {
      io.emit('connection', ws);
    });
  }
});

const PORT = 3001;

// 8. MIDDLEWARE
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================================================
// HTTP ROUTES
// ================================================

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ================================================
// SOCKET.IO (future: user presence, rooms API)
// ================================================

io.on('connection', (socket) => {
  console.log(`Socket.IO user connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket.IO user disconnected: ${socket.id}`);
  });
});

// ================================================
// START THE SERVER
// ================================================

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket server ready on port ${PORT}`);
  console.log(`Yjs sync endpoint: ws://localhost:${PORT}/yjs`);
});
```

> **Key concept — Two WebSocket servers on the same port**:
>
> This is one of the trickiest parts of this phase. We're running TWO WebSocket servers on the same port (3001):
>
> | Server | Path | Purpose | Used by |
> |--------|------|---------|---------|
> | Socket.IO | `/socket.io/*` | User presence, rooms, future features | Our custom code |
> | y-websocket | `/yjs` | CRDT sync — the actual collaboration | Yjs library |
>
> The `httpServer.on('upgrade', ...)` handler acts as a **router**. It looks at the URL path and decides which WebSocket server handles the connection. If someone connects to `/yjs`, it goes to y-websocket. Everything else goes to Socket.IO.

### Step 4 — Update `Frontend/vite.config.js`

We need to add the `/yjs` path to our Vite proxy so that y-websocket connections get forwarded to the backend. Open `Frontend/vite.config.js` and update the proxy section:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* requests to backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Forward Socket.IO WebSocket connections
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      // NEW: Forward Yjs WebSocket connections
      // This is the CRDT sync channel — y-websocket connects here
      '/yjs': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,           // This is a WebSocket connection, not HTTP
        rewrite: (path) => path.replace(/^\/yjs/, ''),  // Remove /yjs prefix so backend sees it as /
      },
    },
  },
})
```

> **Key concept — `rewrite: (path) => path.replace(/^\/yjs/, '')`**:
>
> The backend's y-websocket server expects connections at the root path `/`. But in the browser, we're connecting to `/yjs` (because `/` is the frontend itself). The `rewrite` function strips the `/yjs` prefix before forwarding, so the backend sees the connection as coming to `/` — which is exactly what y-websocket expects.

### Step 5 — Update `Frontend/src/App.jsx`

Now the big one — we replace our manual Socket.IO sync with Yjs + y-monaco. The key change is:

- **OLD**: `socket.on('code-change', data => setCode(data.content))` — send entire document
- **NEW**: Monaco is bound to a Y.Doc via y-monaco — every keystroke becomes a CRDT operation that syncs automatically

Open `Frontend/src/App.jsx` and replace the ENTIRE file:

```jsx
// ================================================
// App.jsx — VS Code Layout + Yjs Collaboration
// ================================================

import { useState, useEffect, useRef, useCallback } from 'react';

// 1. Yjs imports — these are the core CRDT libraries
import * as Y from 'yjs';

// 2. y-websocket — connects Y.Doc to the WebSocket server
import { WebsocketProvider } from 'y-websocket';

// 3. y-monaco — binds Monaco Editor to Yjs
import { MonacoBinding } from 'y-monaco';

import { io } from 'socket.io-client';

// VS Code Shell Components
import TitleBar from './Components/TitleBar';
import ActivityBar from './Components/ActivityBar';
import Sidebar from './Components/Sidebar';
import TabBar from './Components/TabBar';
import WelcomeTab from './Components/WelcomeTab';
import StatusBar from './Components/StatusBar';
import CodeEditor from './Components/CodeEditor';

// Unique ID generator for tabs
let tabIdCounter = 0;
const createTabId = () => `tab-${++tabIdCounter}`;

function App() {
  // ---- Connection State ----
  const [backendStatus, setBackendStatus] = useState('checking');
  const [socketStatus, setSocketStatus] = useState('disconnected');

  // ---- Editor State ----
  const [code, setCode] = useState('// Welcome to CodeTogether!\n// Start typing — your code syncs in real-time.\n\nfunction hello() {\n  console.log("Hello, world!");\n}\n');
  const [language, setLanguage] = useState('javascript');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // ---- UI Layout State ----
  const [activePanel, setActivePanel] = useState('explorer');
  const [tabs, setTabs] = useState([
    { id: 'welcome', name: 'Welcome', type: 'welcome' },
  ]);
  const [activeTab, setActiveTab] = useState('welcome');

  // ---- Yjs State ----
  // ydoc = the CRDT document. This lives in browser memory.
  // It's the single source of truth for the shared code.
  const ydocRef = useRef(null);
  
  // provider = the WebSocket bridge. It connects ydoc to the backend server.
  // Changes made to ydoc automatically get sent to the server, which broadcasts
  // to all other connected clients, whose ydocs get updated automatically.
  const providerRef = useRef(null);
  
  // bindingRef = the link between Monaco Editor and Yjs.
  // When you type in Monaco, it writes to ydoc (not local state).
  // ydoc syncs via provider to other clients.
  const bindingRef = useRef(null);

  // ---- Refs ----
  const editorRef = useRef(null);     // Monaco editor instance
  const ytextRef = useRef(null);      // Yjs text type within the Y.Doc
  const socketRef = useRef(null);     // Socket.IO connection (for future features)

  // ---- Yjs + WebSocket Setup ----
  useEffect(() => {
    // 1. Create a Y.Doc — this is the CRDT document that holds our shared code
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // 2. Get a Y.Text type from the document
    // Y.Text is a CRDT type specifically for text. It handles character-by-character
    // merging automatically. We use 'content' as the key — this can be any string.
    const ytext = ydoc.getText('content');
    ytextRef.current = ytext;

    // 3. Set the initial content if Y.Text is empty
    // This runs only on first load — after that, the Y.Text is the source of truth
    if (ytext.length === 0) {
      const initialCode = '// Welcome to CodeTogether!\n// Start typing — your code syncs in real-time.\n\nfunction hello() {\n  console.log("Hello, world!");\n}\n';
      ytext.insert(0, initialCode);
    }

    // 4. Create a WebSocket provider that syncs the Y.Doc
    // url: where to connect (Vite proxy forwards /yjs to backend)
    // roomname: every client in the same "room" shares the same document
    // We use a hardcoded 'codetogether' room for now — in Phase 5, 
    // each room URL will have its own room name
    const provider = new WebsocketProvider(
      'ws://localhost:5173/yjs',  // Connect through Vite proxy
      'codetogether',              // Room name — all clients here share the same doc
      ydoc                         // The Y.Doc to sync
    );
    providerRef.current = provider;

    // 5. Listen for connection status changes
    // y-websocket has its own awareness protocol for tracking who's online
    provider.on('status', (event) => {
      console.log('Yjs connection status:', event.status);
      setSocketStatus(event.status === 'connected' ? 'connected' : 'disconnected');
    });

    // 6. Check HTTP backend health (same as before)
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // 7. Connect Socket.IO for future features (user presence, room management)
    const socket = io('http://localhost:5173');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
    });

    // Cleanup on unmount — disconnect from WebSocket and destroy the Y.Doc
    return () => {
      provider.destroy();
      ydoc.destroy();
      socket.disconnect();
    };
  }, []);

  // ---- Bind Monaco to Yjs ----
  // This effect runs whenever the active tab or editor changes.
  // It creates/destroys the Monaco-Yjs binding as needed.
  useEffect(() => {
    const editor = editorRef.current;
    const ytext = ytextRef.current;
    const provider = providerRef.current;

    // Only bind if we have all three AND the current tab is an editor tab
    if (!editor || !ytext || !provider) return;

    const currentTab = tabs.find((t) => t.id === activeTab);
    if (currentTab?.type !== 'editor') return;

    // Destroy existing binding if any (when switching tabs)
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    // Create a new binding between Monaco and Yjs
    // MonacoBinding does the magic: every keystroke in Monaco becomes a Y.Text operation
    // That operation is synced via provider to all other clients
    // And incoming operations from other clients update Monaco automatically
    const model = editor.getModel();
    if (model) {
      bindingRef.current = new MonacoBinding(
        ytext,          // The Yjs text type to bind to
        model,          // Monaco's text model for this editor
        new Set([editor]), // The Monaco editor instance(s) to bind
        provider.awareness  // For sharing cursor positions later (Phase 6)
      );
    }

    return () => {
      // Cleanup binding when effect re-runs or component unmounts
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [activeTab, tabs]);

  // ---- Editor Change Handler ----
  // With Yjs binding, Monaco handles all the text changes automatically.
  // We no longer need to manually emit code changes!
  // This handler is now just for cursor tracking.
  const handleCodeChange = useCallback((newCode) => {
    // Update local state for any UI elements that read from it
    setCode(newCode);
    // Note: We DON'T emit to a server here anymore.
    // Monaco writes to ytext → ytext syncs via provider → other clients receive it
  }, []);

  // ---- Tab Management ----
  const openFile = useCallback((fileName) => {
    const existingTab = tabs.find((t) => t.name === fileName);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const ext = fileName.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      json: 'json', md: 'markdown', css: 'css', html: 'html',
      py: 'python', java: 'java', cpp: 'cpp', go: 'go', rs: 'rust',
    };

    const newTab = {
      id: createTabId(),
      name: fileName,
      type: 'editor',
      language: langMap[ext] || 'plaintext',
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    setLanguage(newTab.language);
  }, [tabs]);

  const handleNewFile = useCallback(() => {
    const newTab = {
      id: createTabId(),
      name: 'Untitled-1',
      type: 'editor',
      language: 'plaintext',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);
    setCode('');
    setLanguage('plaintext');
  }, []);

  const closeTab = useCallback((tabId) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        const welcomeTab = { id: 'welcome', name: 'Welcome', type: 'welcome' };
        setActiveTab('welcome');
        return [welcomeTab];
      }
      return newTabs;
    });
  }, [activeTab]);

  const switchTab = useCallback((tabId) => {
    setActiveTab(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab && tab.language) {
      setLanguage(tab.language);
    }
  }, [tabs]);

  // ---- Cursor Position Tracking ----
  const handleEditorMount = useCallback((editor) => {
    // Store the Monaco editor instance so we can bind it to Yjs
    editorRef.current = editor;

    // Track cursor position for the status bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Focus the editor immediately
    editor.focus();
  }, []);

  const currentTab = tabs.find((t) => t.id === activeTab);

  // ---- Render ----
  return (
    <div className="vscode-app">
      <TitleBar
        socketStatus={socketStatus}
        backendStatus={backendStatus}
      />

      <div className="vscode-main">
        <ActivityBar
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        <Sidebar
          activePanel={activePanel}
          onFileOpen={openFile}
        />

        <div className="vscode-editor-area">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabClick={switchTab}
            onTabClose={closeTab}
          />

          <div className="vscode-editor-content">
            {currentTab?.type === 'welcome' ? (
              <WelcomeTab onNewFile={handleNewFile} />
            ) : (
              <CodeEditor
                value={ytextRef.current?.toString() || ''}
                onChange={handleCodeChange}
                language={language}
                onMount={handleEditorMount}
              />
            )}
          </div>
        </div>
      </div>

      <StatusBar
        language={language}
        socketStatus={socketStatus}
        lineNumber={cursorPosition.line}
        columnNumber={cursorPosition.column}
      />
    </div>
  );
}

export default App;
```

> **Key concept — How Yjs + Monaco binding works**:
>
> Without Yjs binding: `User types "hello"` → Monaco fires `onChange("hello")` → we call `setCode("hello")` → we emit `socket.emit('code-change', "hello")` → server broadcasts → other clients receive "hello" and call `setCode("hello")` → **last write wins**
>
> With Yjs binding: `User types "hello"` → Monaco fires `onChange("hello")` → **MonacoBinding intercepts this** → writes `Y.Text.insert(0, "hello")` to the Y.Doc → Y.Doc computes the minimal operation (`insert "hello" at position 0`) → provider sends this operation over WebSocket → other clients' Y.Docs receive the operation → their Y.Text is updated → their Monaco model is updated → their editor shows "hello" → **automatic merge, no conflicts**
>
> The magic is that `MonacoBinding` sits between Monaco's text model and the actual text storage. All edits flow through Y.Text, which is a CRDT type that can be merged mathematically.

### Step 6 — Test It!

1. Make sure both servers are running:
```bash
# Terminal 1 — Backend
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Backend"
npm run dev

# Terminal 2 — Frontend
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor/Frontend"
npm run dev
```

2. Open **THREE browser windows** at `http://localhost:5173`
3. Type in any window — it appears in ALL windows instantly
4. **The key test**: Have two people type at the same position simultaneously. With Yjs, both characters appear — no one gets overwritten!
5. Check your backend terminal — you should see y-websocket connection logs
6. Check the browser console — you should see `Yjs connection status: connected`

### Step 7 — Commit

```bash
cd "/Volumes/SanDisk SSD/Coding/Gemini Pro/Code Editor"
git add .
git commit -m "Phase 4: Yjs CRDT real-time collaboration with y-monaco"
git push
```

---

## How the Data Flows (Updated)

**OLD approach (Phase 2-3):**
```
User types "hello"
  → emit entire document as string
    → server broadcasts string
      → other clients receive entire string
        → last one to receive WINS
```

**NEW approach (Phase 4):**
```
User types "hello"
  → Monaco fires onChange
    → MonacoBinding intercepts
      → Y.Text.insert(0, "hello")  ← CRDT operation
        → provider syncs operation over WebSocket
          → server relays to all clients
            → each Y.Doc merges operation
              → Monaco model updates automatically
                → all clients show "hello"
```

---

## New Concepts Learned

| Concept | What it means |
|---------|--------------|
| **CRDT** | Conflict-free Replicated Data Type — a data structure that merges concurrent edits mathematically without conflicts |
| **Yjs** | A CRDT implementation in JavaScript — gives you Y.Doc, Y.Text, etc. |
| **y-websocket** | WebSocket provider for Yjs — syncs Y.Doc state between clients via WebSocket |
| **y-monaco** | Monaco Binding for Yjs — makes Monaco Editor CRDT-aware |
| **MonacoBinding** | The link between Monaco's text model and Yjs — intercepts all edits and routes them through the CRDT |
| **Y.Doc** | The root CRDT document — holds all shared data (Y.Text, Y.Map, etc.) |
| **Y.Text** | A CRDT type specifically for text — handles character-level merging |
| **Provider** | The bridge between Y.Doc and the network — sends/receives CRDT updates |
| **Room name** | A string that groups clients together — all clients with the same room name share the same document |
| **Double WebSocket routing** | Running two WebSocket servers (Socket.IO + y-websocket) on the same port using path-based routing |
| **URL rewrite in Vite proxy** | `rewrite: (path) => path.replace(...)` — strips a prefix before forwarding |
| **`provider.awareness`** | Yjs's built-in feature for sharing ephemeral state (cursor positions, user names) — we'll use this in Phase 6 |

---

## Updated Project Structure

```
Code Editor/
├── Backend/
│   ├── index.js           ← Express + y-websocket server (UPDATED)
│   ├── swagger.js
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── App.jsx        ← Yjs integration + VS Code layout (UPDATED)
│   │   ├── Components/
│   │   │   ├── CodeEditor.jsx  ← Monaco Editor
│   │   │   ├── TitleBar.jsx
│   │   │   ├── ActivityBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── FileExplorer.jsx
│   │   │   ├── SearchPanel.jsx
│   │   │   ├── TabBar.jsx
│   │   │   ├── WelcomeTab.jsx
│   │   │   └── StatusBar.jsx
│   │   └── index.css
│   ├── vite.config.js     ← Added /yjs proxy (UPDATED)
│   └── package.json
├── Documentation/
│   └── Walkthroughs.md
├── .gitignore
└── README.md
```

---

## What Changed from Phase 3.5

| What | Before (Phase 3.5) | After (Phase 4) |
|------|-------------------|-----------------|
| Sync mechanism | Socket.IO broadcasting entire document | Yjs CRDT with y-websocket |
| Conflict handling | Last write wins (data loss) | Automatic merge (no data loss) |
| Data sent | Entire document string | Tiny CRDT operations (insert/delete) |
| State management | `useState` for code + manual emit | Y.Doc as source of truth |
| Tab binding | Each tab had its own code state | All tabs share one Y.Doc (simplified for Phase 4) |
| Backend | Socket.IO only | y-websocket + Socket.IO coexisting |

---

## 🚀 You're Ready for Phase 4!

That's a big conceptual shift — from "send the whole document" to "send tiny operations that merge automatically." 

Go ahead and follow the steps. Let me know when you've:
1. Installed the packages
2. Updated the backend
3. Updated the Vite config
4. Updated App.jsx
5. Tested with multiple browser windows

Take your time. This is the heart of the whole project.

---

# Phase 5: Rooms + Shareable Links (upcoming)

_Will be documented when we start this phase._

---

# Phase 6–8 (upcoming)

_Will be documented as we progress._