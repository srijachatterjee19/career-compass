import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5001;

(async () => {
    try {
      await connectDB(); 

      app.listen(PORT, () => {
        console.log(`🚀 Backend running at http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server due to DB error:', error);
      process.exit(1); // kill the process
    }
  })();


