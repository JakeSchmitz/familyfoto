import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import photosRouter from './routes/photos';
import uploadRouter from './routes/upload';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/photos', photosRouter);
app.use('/api/upload', uploadRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 