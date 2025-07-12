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
import session from 'express-session';
import { isAuthenticated } from './middleware/isAuthenticated';

const app = express();

app.use(helmet());

app.use(express.json());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 reqs per 15min

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser()); //Cookie parser (needed before csrf)

app.use(
    session({
      secret: 'your-secret-key', 
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // set true if using HTTPS
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);



app.use('/api/auth', csrfRoute);
app.use('/api/users',isAuthenticated, userRoutes);
app.use('/', healthRoutes); 

app.use(errorHandler);

export default app;
