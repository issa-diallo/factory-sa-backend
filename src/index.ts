import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import packingListRouter from '@routes/api/v1/packingList';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/v1', packingListRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
