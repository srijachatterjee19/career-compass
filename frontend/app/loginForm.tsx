import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('secret');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Step 1: Get CSRF token
      const csrfRes = await fetch('http://localhost:5000/api/csrf-token', {
        credentials: 'include', // needed to include cookies
      });
      const { csrfToken } = await csrfRes.json();

      // Step 2: Send login request with CSRF token
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        credentials: 'include', // allow cookies to be stored
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Login successful!');
      } else {
        setMessage(`❌ ${data.error || 'Login failed'}`);
      }
    } catch (err) {
      setMessage('❌ Network error');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>🔐 Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Login
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default LoginForm;
