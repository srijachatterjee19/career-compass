'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/auth/csrf-token', {
          credentials: 'include',
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        setMessage('❌ Failed to fetch CSRF token');
      }
    };
    fetchCsrf();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(form),
    });

    const data = await res.json();
    
    if (data.redirect) {
      router.push(data.redirect); // Redirect to the specified URL
      return;
    }
  
    if (res.ok) {
      router.push('/');
      setMessage('✅ Logged in successfully!');
    } else {
      setMessage(`❌ ${data.error || 'Login failed'}`);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
