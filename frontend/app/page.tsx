'use client';

import { useEffect, useState } from 'react';

type User = { _id: string; name: string; email: string };

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('http://localhost:5002/api/users')
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} – {user.email}
          </li>
        ))}
      </ul>
    </main>
  );
}
