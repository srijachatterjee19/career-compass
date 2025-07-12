'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch('http://localhost:5001/api/auth/csrf-token', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => setMessage('Failed to get CSRF token'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/login'); // Redirect to login page after successful registration
      setMessage('✅ Registered successfully!');
      setForm({ name: '', email: '', password: '' });
    } else {
      setMessage(`❌ ${data.error || 'Registration failed'}`);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
