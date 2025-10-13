import { Application } from 'express';
import * as YAML from 'js-yaml';
import * as fs from 'fs';
import path from 'path';

/**
 * Configures Swagger UI for the Express application.
 * Loads the specification from 'openapi.yaml' and uses a CDN for the UI assets.
 * Compatible with serverless environments.
 * @param app - The Express application instance
 */
export const setupSwagger = (app: Application): void => {
  // Default path (adjust if your build structure is different)
  const yamlPath = path.resolve(__dirname, 'openapi.yaml');

  let swaggerSpec: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  try {
    const fileContents = fs.readFileSync(yamlPath, 'utf8');
    swaggerSpec = YAML.load(fileContents) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (error) {
    console.error(
      `ERROR: Failed to load OpenAPI YAML file at ${yamlPath}.`,
      error
    );
    // Use an empty object to prevent the application from crashing
    swaggerSpec = {};
  }

  let swaggerHtml: string;
  try {
    const htmlPath = path.resolve(__dirname, 'swagger.html');
    swaggerHtml = fs.readFileSync(htmlPath, 'utf-8');
  } catch (error) {
    console.error(
      `ERROR: Failed to load Swagger UI HTML file at ${path.resolve(__dirname, 'swagger.html')}.`,
      error
    );
    swaggerHtml = '<html><body>Swagger UI not available</body></html>';
  }

  app.get('/api/v1/openapi.json', (req, res) => {
    res.send(swaggerSpec);
  });

  app.get('/api/v1/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(swaggerHtml);
  });
};
