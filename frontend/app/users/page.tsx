'use client';

import LogoutButton from 'components/LogoutButton';
import UsersView from '../../components/UsersView';

export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <UsersView />
      <LogoutButton />
    </div>
  );
}