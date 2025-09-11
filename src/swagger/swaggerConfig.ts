import { Application } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

/**
 * Loads the OpenAPI document from the YAML file
 * @returns The parsed OpenAPI document
 */
const loadSwaggerDocument = (): OpenAPIV3.Document => {
  const swaggerPath = path.join(
    process.cwd(),
    'src',
    'swagger',
    'openapi.yaml'
  );
  const fileContent = fs.readFileSync(swaggerPath, 'utf8');
  return yaml.load(fileContent) as OpenAPIV3.Document;
};

/**
 * Configures Swagger UI for the Express application
 * @param app - The instance of the Express application
 */
export const setupSwagger = (app: Application): void => {
  const swaggerDocument = loadSwaggerDocument();

  app.use(
    '/api/v1/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );
};
