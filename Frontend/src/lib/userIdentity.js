// ================================================
// Frontend/src/lib/userIdentity.js
// Generates a random identity for the current user
// ================================================

// A curated palette of 12 visually distinct colors.
// These are chosen to be visible on dark backgrounds and distinguishable
// from each other — important when 5+ people are in one room.
const COLORS = [
  '#FF6B6B',  // Coral Red
  '#4ECDC4',  // Teal
  '#45B7D1',  // Sky Blue
  '#96CEB4',  // Sage Green
  '#FFEAA7',  // Butter Yellow
  '#DDA0DD',  // Plum
  '#FF8C42',  // Tangerine
  '#98D8C8',  // Mint
  '#F7DC6F',  // Gold
  '#BB8FCE',  // Lavender
  '#85C1E9',  // Light Blue
  '#F1948A',  // Salmon
];

// Fun animal names so users get a random identity
// (In a future phase, this will be replaced by real login usernames)
const ANIMALS = [
  'Fox', 'Owl', 'Cat', 'Bear', 'Wolf',
  'Hawk', 'Deer', 'Lynx', 'Puma', 'Crow',
  'Seal', 'Hare', 'Wren', 'Dove', 'Frog',
];

/**
 * Generate a random user identity.
 * This runs ONCE per browser tab — so each tab gets its own identity.
 *
 * @returns {{ name: string, color: string }}
 */
export function generateUserIdentity() {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 100);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    name: `${animal}-${number}`,   // e.g., "Fox-42"
    color,                          // e.g., "#FF6B6B"
  };
}