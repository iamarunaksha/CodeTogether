# ⚡ CodeTogether

> A real-time, collaborative, sandboxed code editor built with the VS Code aesthetic. 

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Live-brightgreen.svg)](https://code-together-arunaksha.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=FFD62E)](#)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT-FF8C00)](#)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-007ACC?logo=visualstudiocode&logoColor=white)](#)

CodeTogether is a powerful, web-based collaborative IDE that allows multiple users to type, edit, and execute code simultaneously in real-time. Modeled deeply after the VS Code desktop experience, it brings professional-grade editing paradigms directly to your browser without the need for logins or complex setups.

---

## 🌟 Key Features

* **Real-time Collaboration:** Powered by Yjs (CRDTs), allowing multiple users to edit the same file without conflicting lockouts.
* **Live Cursors & Presence:** Seamlessly see exactly what your peers are doing with uniquely colored name-badged remote cursors.
* **VS Code Aesthetic & Engine:** Built heavily on top of Microsoft's `Monaco Editor`, inheriting native syntax highlighting, minimaps, multi-cursor, and command palette functionalities.
* **Sandboxed Code Execution:** Securely execute Javascript directly in the browser via an isolated, Blob URL-driven `<iframe>` engine. 
* **Integrated Terminal:** A draggable, resizable mock terminal that intercepts and displays all `console.log` and unhandled exceptions outputted by user code.
* **Persistent Rooms:** Backend persistence via LevelDB ensures your code fragments never get lost even if the entire room disconnects.

## 📸 Screenshots

| The Welcome Dash | The Collaborative Editor |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/976354a6-0248-4f06-837f-a9121cc97c73" width="450" /> | <img src="https://github.com/user-attachments/assets/926a4d65-e8ee-4d32-9517-dbcdeec9db1a" width="450" /> |

<br>

---

## 💻 Tech Stack

### Frontend
- **React.js (Vite)**
- **Monaco Editor** (`@monaco-editor/react`)
- **Yjs & y-websocket** (CRDT protocol state management)
- **Vanilla CSS** (Carefully crafted VS Code theme tokens and flexbox-driven architecture)

### Backend
- **Node.js & Express**
- **Yjs (y-websocket)** (Intercepted via proxy upgrade on Express HTTP Server)
- **LevelDB** (`y-leveldb` for persistent storage of Yjs binaries on disk)
- **Socket.io** (For fallback signaling and room management health-checks)

---

## 🚀 Quick Start (Local Setup)

Want to run this locally? You'll need two separate terminal windows for the frontend and backend.

**1. Start the API/WebSocket Server:**
```bash
cd CodeTogetherAPI
npm install
npm run dev
```
*(The backend will start on port 3001 and create a local ./yjs-data folder for persistence)*

**2. Start the Frontend Application:**
```bash
cd Frontend
npm install
npm run dev
```

The frontend will open on `http://localhost:5173`. Create a room, open a new Incognito window, paste the room URL, and watch the collaborative magic happen!

---

## 🏛️ Architecture & Sandox
The integrated code execution feature is built securely. Code is never evaluated (`eval()`) in the parent DOM. Instead, the runner converts the user's string data into a `Blob`, creates a pseudo-URL via `URL.createObjectURL()`, and attaches it to an invisible `<iframe>` locked down by the standard HTML5 `sandbox="allow-scripts"` attributes, completely severing parent-cookie and storage access. 
