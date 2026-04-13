// ================================================
// Frontend/src/lib/collaboration.js
// ================================================

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

/* ---- The store ----
We keep a "cache" of active rooms. If two components need the same room, 
they get the SAME ydoc and provider (not duplicates).*/
const activeRooms = new Map();

/**
 * Get or create a Yjs document + provider for a specific room.
 * 
 * @param {string} roomId — the unique room ID (from the URL)
 * @returns {{ ydoc: Y.Doc, yText: Y.Text, provider: WebsocketProvider }} */
export function getRoom(roomId) {
  
  // If room already exists, return the existing one
  if(activeRooms.has(roomId)) {
    return activeRooms.get(roomId);
  }
  
  // Create a brand-new Yjs document for this room
  const ydoc = new Y.Doc();
  
  // Create the shared text type (same key 'monaco' as Phase 4)
  const yText = ydoc.getText('monaco');
  
  /* Connect to the Yjs WebSocket server with this specific room ID.
   The server automatically creates a separate "room" for each unique roomId.
   Two users connecting with roomId "abc-123" share data.
   A user connecting with roomId "xyz-789" gets completely separate data. */
  const provider = new WebsocketProvider(
    'ws://localhost:1234',
    roomId,
    ydoc
  );

  // Store in the cache
  const room = { ydoc, yText, provider };
  activeRooms.set(roomId, room);
  
  return room;
}
/*
 Clean up a room when we leave it.
 This prevents memory leaks — we don't want zombie WebSocket connections 
 hanging around for rooms we're no longer viewing.
 */
export function leaveRoom(roomId) {

  if(activeRooms.has(roomId)) {
    const { provider, ydoc } = activeRooms.get(roomId);
    provider.disconnect();  // Close the WebSocket connection
    ydoc.destroy();         // Free up the Yjs document memory
    activeRooms.delete(roomId);  // Remove from cache
    console.log(`🚪 Left room: ${roomId}`);
  }
}