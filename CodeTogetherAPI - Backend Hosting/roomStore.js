// ================================================
// Backend/roomStore.js — Simple Room Metadata Store
// ================================================

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'rooms.json');

// Load existing rooms from file, or start with empty object
function loadRooms() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading rooms:', err);
  }
  return {};
}

// Save rooms to file
function saveRooms(rooms) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(rooms, null, 2));
}

// Create a new room entry
function createRoom(roomId, metadata = {}) {
  const rooms = loadRooms();
  rooms[roomId] = {
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    ...metadata,
  };
  saveRooms(rooms);
  return rooms[roomId];
}

// Get a specific room
function getRoom(roomId) {
  const rooms = loadRooms();
  return rooms[roomId] || null;
}

// Update last active timestamp
function touchRoom(roomId) {
  const rooms = loadRooms();
  if (rooms[roomId]) {
    rooms[roomId].lastActive = new Date().toISOString();
    saveRooms(rooms);
  }
}

// Get all rooms
function getAllRooms() {
  return loadRooms();
}

module.exports = { createRoom, getRoom, touchRoom, getAllRooms };
