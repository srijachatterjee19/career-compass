'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/auth/csrf-token', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));
  }, []);

  const handleLogout = async () => {
    const res = await fetch('http://localhost:5001/api/auth/logout', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
    });

    if (res.ok) {
      router.push('/'); 
      alert('✅ Logged out');
    } else {
      alert('❌ Logout failed');
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
