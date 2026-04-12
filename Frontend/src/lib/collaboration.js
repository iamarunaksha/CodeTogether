// ================================================
// Frontend/src/lib/collaboration.js
// ================================================

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// We use one room name for this phase.
// In Phase 5, this will come from a shareable room ID in the URL.
const ROOM_NAME = 'Room 1';

// Create one shared Yjs document for this browser tab.
const ydoc = new Y.Doc();

// Create a shared text type inside the document.
// Think of this as the collaborative text buffer that Monaco will bind to.
const yText = ydoc.getText('monaco');

// Connect this browser tab to the Yjs websocket server.
const provider = new WebsocketProvider('ws://localhost:1234', ROOM_NAME, ydoc);

export { ydoc, yText, provider, ROOM_NAME };