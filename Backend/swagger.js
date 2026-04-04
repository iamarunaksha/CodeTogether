// ================================================
// Backend/swagger.js — Swagger (OpenAPI) Configuration
// ================================================

const swaggerJsdoc = require('swagger-jsdoc');

// This object describes ENTIRE API at a high level
const options = {
  definition: {
    openapi: '3.0.0',  // The OpenAPI version
    info: {
      title: 'CodeTogether API',             // Name shown at the top of the Swagger page
      version: '1.0.0',                      // API version
      description: 'API for the CodeTogether real-time collaborative code editor',
    },
    servers: [
      {
        url: 'http://localhost:3001',         // Where API runs
        description: 'Development Server',
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