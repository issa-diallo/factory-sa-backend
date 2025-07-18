import express, { Application } from 'express';
import cors from 'cors';
import packingListRouter from './routes/api/v1/packingList';
import authRouter from './routes/api/v1/auth';
import companyRouter from './routes/api/v1/company';
import domainRouter from './routes/api/v1/domain';
import roleRouter from './routes/api/v1/role';
import permissionRouter from './routes/api/v1/permission';
import userManagementRouter from './routes/api/v1/userManagement';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/packing-list', packingListRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/domains', domainRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/permissions', permissionRouter);
app.use('/api/v1/users', userManagementRouter);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Factory Backend API' });
});

export default app;
