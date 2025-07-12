'use client';

import { useEffect, useState } from 'react';

type User = { _id: string; name: string; email: string };

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/users')
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg text-white font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </main>
  );
}