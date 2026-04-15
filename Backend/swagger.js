// ================================================
// Backend/swagger.js — Swagger (OpenAPI) Config
// ================================================

const swaggerJsdoc = require('swagger-jsdoc');

// This object describes ENTIRE API at a high level
const options = {
  definition: {
    openapi: '3.0.0',  // The OpenAPI version
    info: {
      title: 'CodeTogether API',             
      version: '1.0.0',                      
      description: 'API for the CodeTogether real-time collaborative code editor',
    },
    servers: [
      {
        url: 'http://localhost:3001',       
        description: 'Development Server',
      },
    ],
  },
  
  apis: ['./*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
