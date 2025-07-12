import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';

dotenv.config();

(async () => {
    try {
        console.log(`test database: ${process.env.MONGO_URI}`);

      await connectDB(); 
      
      app.listen(PORT, () => {
        console.log(`🚀 Backend running at http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server due to DB error:', error);
      process.exit(1); // kill the process
    }
  })();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Backend on http://localhost:${PORT}`));
