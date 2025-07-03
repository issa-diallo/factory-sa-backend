import 'module-alias/register';
import express, { Application } from 'express';
import cors from 'cors';
import packingListRouter from '@routes/api/v1/packingList';
import { setupAdminJS } from '@admin/admin.router';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', packingListRouter);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Factory Backend API' });
});

// Asynchronous initialization function to configure AdminJS
const initApp = async (): Promise<Application> => {
  try {
    // Configure AdminJS
    await setupAdminJS(app);
    return app;
  } catch (error) {
    console.error('Error during application initialization:', error);
    return app;
  }
};

// Export the initialization promise and the application
export const appPromise = initApp();
export default app;
