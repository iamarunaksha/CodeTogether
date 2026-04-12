const { WebsocketProvider } = require('y-websocket');
const Y = require('yjs');
const ydoc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:1234', 'test', ydoc);
console.log(Object.keys(provider));
process.exit(0);
