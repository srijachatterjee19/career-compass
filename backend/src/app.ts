import express from 'express';
import cors from 'cors';
import healthRoutes from './health';
import userRoutes from './routes/UserRoutes';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', userRoutes);
app.use('/', healthRoutes); 

export default app;
