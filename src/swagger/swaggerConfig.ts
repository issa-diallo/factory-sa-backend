import { Application } from 'express';

/**
 * Configures Swagger JSON endpoint for the Express application
 * Compatible with serverless environments - uses bundled JSON instead of filesystem
 * @param app - The instance of the Express application
 */
export const setupSwagger = (app: Application): void => {
  app.get('/api/v1/api-docs', async (req, res) => {
    try {
      // Load JSON at runtime for serverless compatibility
      const swaggerDocument = await import('./openapi.json');
      res.json(swaggerDocument.default);
    } catch {
      res.status(500).json({
        error: 'Swagger documentation not available',
      });
    }
  });
};
