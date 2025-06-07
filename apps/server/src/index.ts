import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { photosRouter } from './routes/photos';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/photos', photosRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 