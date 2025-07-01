import 'module-alias/register';
import express, { Application } from 'express';
import cors from 'cors';
import packingListRouter from '@routes/api/v1/packingList';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', packingListRouter);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Factory Backend API' });
});

export default app;
