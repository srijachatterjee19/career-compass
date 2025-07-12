import express from 'express';
import cors from 'cors';
import healthRoutes from './health';
import userRoutes from './routes/UserRoutes';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';


const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 reqs per 15min


app.use('/api/users', userRoutes);
app.use('/', healthRoutes); 
app.use(errorHandler);

export default app;
