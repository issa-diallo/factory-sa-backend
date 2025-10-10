import { Application } from 'express';
import fs from 'fs';
import path from 'path';
import * as YAML from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

/**
 * Configures Swagger endpoint for the Express application
 * Compatible with serverless environments - loads YAML at runtime using bundled file
 * @param app - The instance of the Express application
 */
export const setupSwagger = (app: Application): void => {
  try {
    // Load YAML at startup for Swagger UI setup
    const yamlPath = path.join(__dirname, 'openapi.yaml');
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const swaggerDocument = YAML.load(yamlContent) as object;

    app.use(
      '/api/v1/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  } catch (error) {
    console.error('Error loading Swagger documentation:', error);
  }
};
