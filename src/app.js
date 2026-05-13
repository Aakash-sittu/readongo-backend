import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Trust the first proxy (Google Cloud Run's load balancer)
// Required for express-rate-limit to correctly read the real client IP
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the ReadOnGo API' });
});

// Error handling
app.use(errorHandler);

export default app;
