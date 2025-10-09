import 'reflect-metadata';
import './container';
import express, { Application } from 'express';
import cors from 'cors';
import { setupSwagger } from './swagger/swaggerConfig';

import packingListRouter from './routes/api/v1/packingList';
import authRouter from './routes/api/v1/auth';
import companyRouter from './routes/api/v1/company';
import domainRouter from './routes/api/v1/domain';
import roleRouter from './routes/api/v1/role';
import permissionRouter from './routes/api/v1/permission';
import userManagementRouter from './routes/api/v1/userManagement';

const app: Application = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://factory-sa-backend.vercel.app',
    ],
    credentials: true,
  })
);
app.use(express.json());

setupSwagger(app);

app.use('/api/v1/packing-list', packingListRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/domains', domainRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/permissions', permissionRouter);
app.use('/api/v1/users', userManagementRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Factory Backend API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default app;
