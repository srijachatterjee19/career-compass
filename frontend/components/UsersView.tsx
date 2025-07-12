'use client';

import React, { useEffect, useState } from 'react';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

const UsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');

  // Fetch CSRF token
  useEffect(() => {
    fetch('http://localhost:5001/api/auth/csrf-token', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));
  }, []);

  // Fetch users
  useEffect(() => {
    fetch('http://localhost:5001/api/users', {
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or server error');
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message));
  }, [csrfToken]);

  if (error) return <div>❌ Error: {error}</div>;

  return (
    <div>
      <h2>👥 Users</h2>
      {users.length === 0 ? (
        <p>Loading users...</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              <strong>{u.name}</strong> – {u.email} ({u.role})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UsersView;
