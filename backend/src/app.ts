import express from 'express';
import cors from 'cors';
import healthRoutes from './health';

const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/users', userRoutes);
app.use('/', healthRoutes); 


export default app;
