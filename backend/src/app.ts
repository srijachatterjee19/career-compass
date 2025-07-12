import express from 'express';
import cors from 'cors';
import healthRoutes from './health';
import userRoutes from './routes/user';
import csrfRoute from './routes/csrf';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { login } from './controllers/authController';

const app = express();

app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(compression());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 reqs per 15min


app.use(cookieParser());
app.use(express.json());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.post('/api/login', login);
app.use('/api/users', userRoutes);
app.use('/', healthRoutes); 
app.use('/api', csrfRoute);
app.use(errorHandler);

export default app;
