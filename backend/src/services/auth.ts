import { getCsrfToken } from '../utils/csrf';
import logger from '../config/logger';

export const registerUser = async (user: {
  name: string;
  email: string;
  password: string;
}) => {
  const csrfToken = await getCsrfToken();

  logger.info(`CSRF Token: ${csrfToken}`);

  const res = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include', // required to send session cookie
    body: JSON.stringify(user),
  });

    if (!res.ok) {
        const errorData = await res.json();
        logger.error(`❌ Registration failed: ${errorData.error}`);
        throw new Error(errorData.error);
    }
    
  return await res.json();
};