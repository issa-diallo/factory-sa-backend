import { Application, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as YAML from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

/**
 * Middleware to serve OpenAPI specification as JSON
 * Endpoint dedicated for Swagger UI to load spec without static assets issues on Vercel
 * @param req - Express request object
 * @param res - Express response object
 */
const serveOpenApiJson = (req: Request, res: Response): void => {
  try {
    const yamlPath = path.join(__dirname, 'openapi.yaml');
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const swaggerDocument = YAML.load(yamlContent) as object;

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerDocument);
  } catch (error) {
    console.error('Error serving OpenAPI JSON:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Configures Swagger endpoints for the Express application
 * Compatible with serverless environments (Vercel) - separates UI and spec endpoints
 * @param app - The instance of the Express application
 */
export const setupSwagger = (app: Application): void => {
  try {
    // Endpoint for serving OpenAPI spec as JSON for Swagger UI consumption
    app.get('/api/v1/openapi.json', serveOpenApiJson);

    // Swagger UI setup with external spec URL to avoid static asset issues on Vercel
    app.use(
      '/api/v1/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(null, {
        swaggerUrl: '/api/v1/openapi.json',
        swaggerOptions: {
          url: '/api/v1/openapi.json',
        },
      })
    );
  } catch (error) {
    console.error('Error configuring Swagger:', error);
  }
};
