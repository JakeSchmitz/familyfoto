import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import photosRouter from './routes/photos';
import uploadRouter from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Debug logging for storage configuration
const hasGcsConfig = process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_BUCKET_NAME;
console.log('Storage Configuration:');
console.log(hasGcsConfig ? 'Using Google Cloud Storage for photo uploads.' : 'Using local storage for photo uploads.');

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/photos', photosRouter);
app.use('/api/photos/upload', uploadRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
}); 